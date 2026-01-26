# api-routes Specification

## Purpose

TBD - created by archiving change add-session-api-routes. Update Purpose after archive.
## Requirements
### Requirement: Testing Support

The system SHALL provide a `requests.http` file in the project root for manual testing of session API endpoints using REST client tools.

#### Scenario: Manual test setup

- **WHEN** developers need to test the session API endpoints
- **THEN** a `requests.http` file is available at the project root
- **THEN** the file includes example requests for all endpoints
- **THEN** the file documents environment variables needed (DEV_USER_ID, SESSION_ID)
- **THEN** the file includes test cases for success and error scenarios

### Requirement: Session Creation Endpoint
The system SHALL provide a POST endpoint at `/api/sessions` that creates a new session with a Backboard thread created via SDK.

#### Scenario: Create new session successfully
- **WHEN** an authenticated user sends a POST request to `/api/sessions`
- **THEN** the Backboard SDK creates a new thread using `createThread()` method
- **THEN** a new Session record is created in the database with:
  - A unique ID (UUID)
  - Default title "New Trip"
  - The authenticated user's ID
  - The `threadId` returned from the SDK's `createThread()` method
- **THEN** the endpoint returns the created session with HTTP 201
- **THEN** the response includes: id, title, userId, threadId, createdAt, updatedAt

#### Scenario: Create session without authentication
- **WHEN** an unauthenticated user sends a POST request to `/api/sessions`
- **THEN** the endpoint returns HTTP 401 Unauthorized
- **THEN** an error message indicates authentication is required

#### Scenario: SDK thread creation fails
- **WHEN** the Backboard SDK's `createThread()` method throws an error
- **THEN** the endpoint returns HTTP 500 Internal Server Error
- **THEN** a generic error message is returned to the client
- **THEN** no Session record is created in the database

### Requirement: List User Sessions Endpoint

The system SHALL provide a GET endpoint at `/api/sessions` that retrieves all sessions for the authenticated user.

#### Scenario: Retrieve all sessions

- **WHEN** an authenticated user sends a GET request to `/api/sessions`
- **THEN** the endpoint returns an array of all Session records for that user with HTTP 200
- **THEN** sessions are ordered by createdAt descending (newest first)
- **THEN** each session includes: id, title, userId, threadId, createdAt, updatedAt
- **THEN** messages are NOT included (use the single session endpoint to fetch messages)

#### Scenario: Retrieve sessions for user with no sessions

- **WHEN** an authenticated user with no sessions sends a GET request to `/api/sessions`
- **THEN** the endpoint returns HTTP 200 with an empty array
- **THEN** no error is raised (empty result is valid)

### Requirement: Single Session Retrieval Endpoint

The system SHALL provide a GET endpoint at `/api/sessions/[id]` that retrieves all messages within a specific session.

#### Scenario: Retrieve session messages

- **WHEN** an authenticated user sends a GET request to `/api/sessions/[valid-id]`
- **THEN** the endpoint returns the session with all messages with HTTP 200
- **THEN** messages are ordered by createdAt ascending (chronological)
- **THEN** each message includes: id, role, content, createdAt, updatedAt
- **THEN** the response includes session metadata: id, title, threadId

#### Scenario: Retrieve non-existent session

- **WHEN** an authenticated user sends a GET request to `/api/sessions/[non-existent-id]`
- **THEN** the endpoint returns HTTP 404 Not Found
- **THEN** an error message indicates the session does not exist

#### Scenario: Retrieve session owned by another user

- **WHEN** an authenticated user sends a GET request to `/api/sessions/[other-user-session-id]`
- **THEN** the endpoint returns HTTP 403 Forbidden
- **THEN** an error message indicates the user does not have permission

### Requirement: Chat Endpoint
The system SHALL provide a POST endpoint at `/api/sessions/[id]/chat` that uses the Backboard SDK to send messages and stream responses.

#### Scenario: Send message and receive AI response via SDK
- **WHEN** an authenticated user sends a POST request to `/api/sessions/[valid-id]/chat` with message content
- **THEN** a new Message record is created in the database with role="user"
- **THEN** the Backboard SDK sends the user's message to the session's thread using appropriate SDK method
- **THEN** the endpoint begins streaming the AI's response using SDK's streaming capabilities
- **THEN** as each chunk of AI response arrives, the content is delivered to the client via SSE
- **THEN** after streaming completes, a Message record is created with role="assistant"

#### Scenario: Send message to non-existent session
- **WHEN** an authenticated user sends a POST request to `/api/sessions/[non-existent-id]/chat`
- **THEN** the endpoint returns HTTP 404 Not Found
- **THEN** no message is created in the database
- **THEN** no SDK method is called

#### Scenario: Send message without content
- **WHEN** an authenticated user sends a POST request to `/api/sessions/[valid-id]/chat` without message content
- **THEN** the endpoint returns HTTP 400 Bad Request
- **THEN** an error message indicates message content is required

### Requirement: Request/Response Structure

The system SHALL use JSON for all request and response bodies with consistent structure across all endpoints.

#### Scenario: Request structure validation

- **WHEN** making requests to session endpoints
- **THEN** request bodies use JSON content type (`application/json`)
- **THEN** request fields are validated using Zod schemas
- **THEN** invalid requests return HTTP 400 with validation error details

#### Scenario: Response structure consistency

- **WHEN** receiving successful responses
- **THEN** responses use JSON content type (`application/json`)
- **THEN** responses include only the requested data (no extraneous fields)
- **THEN** response fields match TypeScript types from Prisma models

### Requirement: Error Handling
The system SHALL provide appropriate HTTP status codes and error messages for all error conditions.

#### Scenario: Database error handling
- **WHEN** a database operation fails (connection error, constraint violation)
- **THEN** the endpoint returns HTTP 500 Internal Server Error
- **THEN** the response includes a generic error message (does not expose database details)

#### Scenario: SDK API error handling
- **WHEN** the Backboard SDK throws an error during thread creation or message sending
- **THEN** the chat endpoint returns an appropriate error status (4xx or 5xx)
- **THEN** the user message is still saved to the database
- **THEN** a generic error message is provided to the client (does not expose SDK implementation details)

### Requirement: User Authentication

The system SHALL require Clerk authentication for all session management endpoints.

#### Scenario: Authentication verification

- **WHEN** any endpoint is called without proper authentication
- **THEN** the request is rejected with HTTP 401 Unauthorized
- **THEN** the Clerk user ID is extracted from the request

#### Scenario: User data synchronization

- **WHEN** an authenticated user makes a request
- **THEN** the user's Clerk ID is used as `clerkId` in the database
- **THEN** if the user does not exist in the database, a User record is created
- **THEN** the user is then found by their `clerkId` to obtain the database `userId`

### Requirement: Clerk Middleware Configuration

The system SHALL configure Clerk middleware at the project root to enable authentication for API routes.

#### Scenario: Middleware exists at correct path

- **WHEN** the Next.js application starts
- **THEN** a proxy file exists at `./src/proxy.ts`
- **THEN** the proxy uses `clerkMiddleware()` from Clerk Next.js SDK
- **THEN** the proxy is configured with a matcher that includes all API routes

#### Scenario: Middleware matches API routes

- **WHEN** a request is made to any `/api/:path*` route
- **THEN** the Clerk middleware intercepts the request
- **THEN** authentication context is attached to the request
- **THEN** the request proceeds to the API route handler

#### Scenario: Missing middleware causes error

- **WHEN** Clerk's `auth()` function is called without middleware configured
- **THEN** Clerk raises an error indicating middleware is required
- **THEN** the error message guides the developer to add the middleware file

### Requirement: Backboard SDK Integration
The system SHALL use the `backboard-sdk` package for all interactions with Backboard.io services including thread management, message sending, and assistant creation.

#### Scenario: SDK package installed
- **WHEN** running `npm install`
- **THEN** the `backboard-sdk` package is installed as a dependency
- **THEN** the SDK version is pinned to ensure stability

#### Scenario: SDK client available
- **WHEN** importing from `src/lib/backboard.ts`
- **THEN** a configured Backboard SDK client is exported
- **THEN** the client is initialized using `BACKBOARD_API_KEY` environment variable


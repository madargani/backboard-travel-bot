## ADDED Requirements

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

## MODIFIED Requirements

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
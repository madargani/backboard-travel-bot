## ADDED Requirements

### Requirement: Session Title Update Endpoint
The system SHALL provide a PATCH endpoint at `/api/sessions/[id]` that allows authenticated users to update the title of a session they own.

#### Scenario: Update session title successfully
- **WHEN** an authenticated user sends a PATCH request to `/api/sessions/[valid-id]` with a valid `title` in the request body
- **THEN** the endpoint updates the session's title in the database
- **THEN** the endpoint returns HTTP 200 OK
- **THEN** the response includes the updated session object with the new title
- **THEN** the session's `updatedAt` timestamp is updated

#### Scenario: Update session with invalid title
- **WHEN** an authenticated user sends a PATCH request to `/api/sessions/[valid-id]` with an empty or missing `title`
- **THEN** the endpoint returns HTTP 400 Bad Request
- **THEN** the response includes an error message indicating the title is required
- **THEN** no database change is made

#### Scenario: Update session with overly long title
- **WHEN** an authenticated user sends a PATCH request to `/api/sessions/[valid-id]` with a `title` exceeding 100 characters
- **THEN** the endpoint returns HTTP 400 Bad Request
- **THEN** the response includes an error message indicating the maximum length
- **THEN** no database change is made

#### Scenario: Update session owned by another user
- **WHEN** an authenticated user sends a PATCH request to `/api/sessions/[other-user-session-id]`
- **THEN** the endpoint returns HTTP 403 Forbidden
- **THEN** the response includes an error message indicating insufficient permissions
- **THEN** no database change is made

#### Scenario: Update non-existent session
- **WHEN** an authenticated user sends a PATCH request to `/api/sessions/[non-existent-id]`
- **THEN** the endpoint returns HTTP 404 Not Found
- **THEN** the response includes an error message indicating the session does not exist

#### Scenario: Update session without authentication
- **WHEN** an unauthenticated user sends a PATCH request to `/api/sessions/[valid-id]`
- **THEN** the endpoint returns HTTP 401 Unauthorized
- **THEN** the response includes an error message indicating authentication is required

### Requirement: Request Body Validation
The PATCH endpoint SHALL validate the request body structure and content using Zod schemas.

#### Scenario: Valid request body structure
- **WHEN** the request body contains a JSON object with a `title` field (string)
- **THEN** validation passes and the request proceeds to title validation

#### Scenario: Invalid request body structure
- **WHEN** the request body is missing, malformed, or not valid JSON
- **THEN** the endpoint returns HTTP 400 Bad Request
- **THEN** the response includes validation error details

### Requirement: Error Handling for Session Update
The system SHALL provide appropriate error handling for the session update endpoint.

#### Scenario: Database error during update
- **WHEN** a database operation fails during the update process
- **THEN** the endpoint returns HTTP 500 Internal Server Error
- **THEN** the response includes a generic error message (does not expose database details)

#### Scenario: Concurrent update handling
- **WHEN** a session is updated by multiple concurrent requests
- **THEN** the last processed update is persisted
- **THEN** the endpoint still returns HTTP 200 OK with the final state
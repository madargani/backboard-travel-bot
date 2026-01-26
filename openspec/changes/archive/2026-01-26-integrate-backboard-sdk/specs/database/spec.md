## ADDED Requirements

### Requirement: Backboard Assistant Creation on User Creation
The system SHALL use the Backboard SDK to create a new assistant for each user when they are first created in the database.

#### Scenario: Assistant created during user creation
- **WHEN** a new Clerk user is synced to the database (user record does not exist)
- **THEN** the Backboard SDK creates a new assistant using appropriate SDK method
- **THEN** the User record is created with `assistantId` set to the assistant ID returned from the SDK
- **THEN** the `assistantId` is unique per user (one-to-one relationship)

#### Scenario: Existing user with assistant
- **WHEN** an existing user makes a request
- **THEN** the `ensureUserExists()` function returns the existing user record
- **THEN** no new assistant is created (assistant already assigned)
- **THEN** the user's existing `assistantId` is returned unchanged

#### Scenario: SDK assistant creation fails
- **WHEN** the Backboard SDK's assistant creation fails
- **THEN** the user creation request returns an error
- **THEN** no User record is created in the database
- **THEN** the error message indicates a service initialization failure

## MODIFIED Requirements

### Requirement: User Model
The system SHALL provide a User model to store user information synchronized from Clerk authentication with a Backboard assistant created via SDK.

#### Scenario: User model structure
- **WHEN** examining the Prisma schema
- **THEN** A `User` model is defined with fields:
  - id: String @id @default(uuid()) (primary key)
  - clerkId: String @unique (Clerk user ID for authentication mapping)
  - assistantId: String @unique (Backboard assistant ID, created by SDK during user creation)
  - email: String (user's email address)
  - name: String? (user's display name, optional)
  - createdAt: DateTime @default(now()) (record creation timestamp)

#### Scenario: User data storage with assistant creation
- **WHEN** a new user is created in Clerk and synced to the database
- **THEN** the Backboard SDK is used to create a new assistant
- **THEN** a corresponding User record is created in the database
- **THEN** the `assistantId` field stores the ID of the assistant created by the SDK
- **THEN** the `clerkId` references the Clerk user ID for mapping
- **THEN** the `id` is used as a local unique identifier in the system

#### Scenario: Backboard assistant mapping
- **WHEN** a user is created
- **THEN** the `assistantId` is populated by the Backboard SDK's assistant creation method
- **THEN** the `assistantId` has a unique constraint (one assistant per user)
- **THEN** the `id` acts as a unique identifier in the local system
- **THEN** the user can have multiple Sessions through the sessions relation

#### Scenario: User-Sessions relation
- **WHEN** examining the User model
- **THEN** A `sessions` relation field exists of type `Session[]`
- **THEN** The User can have zero or many Sessions
- **THEN** Each Session belongs to exactly one User
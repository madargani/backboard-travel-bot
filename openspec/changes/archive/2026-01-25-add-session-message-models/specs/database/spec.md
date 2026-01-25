# database Spec Deltas

## MODIFIED Requirements
### Requirement: User Model
The system SHALL provide a User model to store user information synchronized from Clerk authentication with Backboard.io integration and session management.

#### Scenario: User model structure
- **WHEN** examining the Prisma schema
- **THEN** A `User` model is defined with fields:
  - id: String @id @default(uuid()) (primary key)
  - clerkId: String @unique (Clerk user ID for authentication mapping)
  - assistantId: String @unique (Backboard assistant ID, one-to-one relationship)
  - email: String (user's email address)
  - name: String? (user's display name, optional)
  - createdAt: DateTime @default(now()) (record creation timestamp)

#### Scenario: User data storage
- **WHEN** a new user is created in Clerk
- **THEN** a corresponding record is created in the User table in the database
- **THEN** the `clerkId` references the Clerk user ID for mapping
- **THEN** the `id` is used as a local unique identifier in the system

#### Scenario: Backboard assistant mapping
- **WHEN** a user is created
- **THEN** the `assistantId` stores the Backboard assistant ID (one-to-one)
- **THEN** the `id` acts as a unique identifier in the local system
- **THEN** the user can have multiple Sessions through the sessions relation

#### Scenario: User-Sessions relation
- **WHEN** examining the User model
- **THEN** A `sessions` relation field exists of type `Session[]`
- **THEN** The User can have zero or many Sessions
- **THEN** Each Session belongs to exactly one User
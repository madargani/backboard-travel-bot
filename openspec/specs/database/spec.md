# database Specification

## Purpose
TBD - created by archiving change setup-prisma-database. Update Purpose after archive.
## Requirements
### Requirement: Prisma ORM Integration
The system SHALL provide Prisma ORM v5+ with PostgreSQL support for accessing and managing the database.

#### Scenario: Prisma dependencies installed
- **WHEN** running `npm install`
- **THEN** `@prisma/client` and `prisma` packages are installed as dependencies
- **THEN** no version conflicts exist with other project dependencies

#### Scenario: Prisma client generation
- **WHEN** running `npx prisma generate`
- **THEN** Prisma Client is generated successfully
- **THEN** Generated types are available for TypeScript usage
- **THEN** The generated client can be imported and used in the application

#### Scenario: Prisma command availability
- **WHEN** running `npx prisma`
- **THEN** Prisma CLI commands are available and working
- **THEN** Commands include: `generate`, `db:push`, `db:pull`, `studio`, `migrate`

### Requirement: Prisma Schema Configuration
The system SHALL provide a Prisma schema file that defines the database models and connection configuration.

#### Scenario: Schema file exists
- **WHEN** checking the `prisma/` directory
- **THEN** a `schema.prisma` file exists
- **THEN** The schema is properly formatted with correct Prisma syntax
- **THEN** It specifies the database provider as PostgreSQL

#### Scenario: Database URL configuration
- **WHEN** the application starts
- **THEN** Prisma reads the database URL from environment variables
- **THEN** The connection uses the DATABASE_URL environment variable
- **THEN** The connection string is properly formatted for PostgreSQL

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

### Requirement: Session Model
The system SHALL provide a Session model to represent individual trip conversations, linking users to Backboard thread IDs.

#### Scenario: Session model structure
- **WHEN** examining the Prisma schema
- **THEN** A `Session` model is defined with fields:
  - id: String @id @default(uuid()) (primary key)
  - title: String? @default("New Trip") (optional trip name, defaults to "New Trip")
  - userId: String (foreign key to User model)
  - threadId: String (Backboard thread ID for this session)
  - createdAt: DateTime @default(now()) (timestamp)

#### Scenario: Session-User relation
- **WHEN** a Session record is created
- **THEN** the `userId` field references the User who owns the session
- **THEN** a User can have multiple Sessions (one-to-many relation)
- **THEN** Cascade delete is NOT configured (sessions persist if user reference removed)

#### Scenario: Session to Backboard mapping
- **WHEN** a Session is created
- **THEN** the `threadId` stores exactly one Backboard thread ID
- **THEN** each Session corresponds to a single Backboard conversation thread

### Requirement: Message Model
The system SHALL provide a Message model to store individual chat messages within sessions.

#### Scenario: Message model structure
- **WHEN** examining the Prisma schema
- **THEN** A `Message` model is defined with fields:
  - id: String @id @default(uuid()) (primary key)
  - role: String (either "user" or "assistant")
  - content: String (message text content)
  - sessionId: String (foreign key to Session model)
  - createdAt: DateTime @default(now()) (timestamp)

#### Scenario: Message-Session relation
- **WHEN** a Message record is created
- **THEN** the `sessionId` field references the Session containing the message
- **THEN** a Session can have multiple Messages (one-to-many relation)
- **THEN** Messages are ordered by createdAt timestamp

#### Scenario: Role constraint
- **WHEN** creating a Message record
- **THEN** the `role` field is either "user" or "assistant"
- **THEN** no other values are allowed for the role field

### Requirement: Prisma Client Singleton
The system SHALL provide a singleton instance of Prisma Client for use across the application.

#### Scenario: Client export
- **WHEN** importing from `src/lib/prisma.ts`
- **THEN** a Prisma Client instance is exported
- **THEN** The instance can be imported in API routes and server components

#### Scenario: Client singleton behavior
- **WHEN** Prisma Client is imported multiple times
- **THEN** the same instance is reused (not recreated)
- **THEN** connection pooling is handled efficiently
- **THEN** no "too many connections" errors occur in development

### Requirement: Package Scripts
The system SHALL provide npm scripts for common Prisma operations.

#### Scenario: Prisma commands
- **WHEN** running `npm run prisma:generate`
- **THEN** Prisma Client is regenerated
- **WHEN** running `npm run prisma:db:push`
- **THEN** schema changes are pushed to the database
- **WHEN** running `npm run prisma:studio`
- **THEN** Prisma Studio UI opens for database inspection

### Requirement: TypeScript Configuration
The system SHALL configure TypeScript to recognize generated Prisma types.

#### Scenario: Prisma generator configuration
- **WHEN** examining `tsconfig.json`
- **THEN** the `prisma-client-js` is configured in `compilerOptions.types` or is generated directly by Prisma
- **THEN** generated types are typed correctly in TypeScript

#### Scenario: Type imports work
- **WHEN** importing Prisma types in a file
- **THEN** IntelliSense shows model types (e.g., User)
- **THEN** TypeScript strict mode does not throw errors
- **THEN** types can be used for type annotations in functions

### Requirement: Environment Variable Documentation
The system SHALL document the required database environment variables.

#### Scenario: Required database variables
- **WHEN** examining `.env.example`
- **THEN** DATABASE_URL is documented with placeholder
- **THEN** POSTGRES_URL is documented with placeholder
- **THEN** PRISMA_DATABASE_URL is documented with placeholder
- **THEN** Each variable has a comment explaining its purpose

#### Scenario: Environment variable priority
- **WHEN** multiple database URL variables are configured
- **THEN** DATABASE_URL takes highest priority if set
- **THEN** The schema documents which variable is used by Prisma

### Requirement: Database Unique Constraints
The system SHALL define proper unique constraints for data integrity.

#### Scenario: Model unique constraints
- **WHEN** examining the Prisma schema
- **THEN** Unique constraints exist on clerkId (for Clerk user mapping)
- **THEN** Unique constraint exists on assistantId (one-to-one with Backboard assistant)

#### Scenario: Data integrity
- **WHEN** data is inserted or updated
- **THEN** unique constraints prevent duplicate user records
- **THEN** clerkId uniqueness ensures one database user per Clerk user

### Requirement: Git Configuration for Prisma
The system SHALL track Prisma schema in git while excluding generated files and migration files.

#### Scenario: What is tracked
- **WHEN** running `git status`
- **THEN** `prisma/schema.prisma` is in the changed files list (if modified)
- **THEN** The schema can be committed to version control

#### Scenario: What is excluded
- **WHEN** examining `.gitignore`
- **THEN** `prisma/migrations/` is excluded (if using db:push approach)
- **THEN** `node_modules/.prisma/` is excluded
- **THEN** Generated client files in `node_modules/@prisma/client/` are excluded

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


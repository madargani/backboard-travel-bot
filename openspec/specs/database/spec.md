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
The system SHALL provide a User model to store user information synchronized from Clerk authentication with Backboard.io integration.

#### Scenario: User model structure
- **WHEN** examining the Prisma schema
- **THEN** A `User` model is defined with fields:
  - id: String @id @default(cuid())
  - clerkId: String @unique (Clerk user ID for authentication mapping)
  - assistantId: String @unique (Backboard assistant ID, one-to-one relationship)
  - threadIds: String[] (array of Backboard thread IDs, supports multiple conversations)
  - email: String (user's email address)
  - name: String? (user's display name, optional)
  - createdAt: DateTime @default(now()) (record creation timestamp)
  - updatedAt: DateTime @updatedAt (last update timestamp)

#### Scenario: User data storage
- **WHEN** a new user is created in Clerk
- **THEN** a corresponding record is created in the User table in the database
- **THEN** The `clerkId` references the Clerk user ID for mapping
- **THEN** The `id` is used as a local unique identifier in the system

#### Scenario: Backboard assistant mapping
- **WHEN** a user is created
- **THEN** the `assistantId` stores the Backboard assistant ID (one-to-one)
- **THEN** the `threadIds` array stores all Backboard thread IDs associated with the user
- **THEN** the user can have multiple threads but shares the same assistant

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


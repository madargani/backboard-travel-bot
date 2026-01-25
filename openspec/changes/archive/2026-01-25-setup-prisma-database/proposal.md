# Change: Set up Prisma database

## Why

The travel-bot project currently lacks database infrastructure. According to the project.md specifications, the system needs a Prisma Postgres database to handle structured data (User IDs, Saved Itineraries, Account Settings) as part of a dual-memory model alongside Backboard.io for semantic memory.

## What Changes

- Install Prisma ORM and PostgreSQL dependencies
- Create Prisma schema directory and configuration
- Define User model with Backboard.io integration
  - clerk_id: maps to Clerk authentication
  - assistant_id: Backboard.io assistant (one-to-one)
  - thread_ids: store multiple conversation threads (array)
  - Additional fields: email, name, createdAt, updatedAt
- Set up environment variable configuration for database connection
- Generate Prisma Client
- Configure Prisma runtime in project entry points
- Add package.json scripts for Prisma operations

## Impact

- **Affected specs**: `database` (NEW capability)
- **Affected code**:
  - `package.json` - add dependencies and scripts
  - `.env.example` - add DATABASE_URL, POSTGRES_URL, PRISMA_DATABASE_URL (already present)
  - `prisma/` - new directory with schema.prisma (User model only)
  - `src/lib/prisma.ts` - new client singleton
  - `tsconfig.json` - add prisma-client-js type generator
  - `.gitignore` - ensure prisma schema is tracked but migrations excluded
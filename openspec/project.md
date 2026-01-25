# Project Context

## Purpose

**Backboard Travel-Bot** is an AI-powered travel assistant. Its primary goal is to demonstrate the power of **Backboard.io**'s persistent memory capabilities. Unlike standard chatbots that forget context between sessions, Backboard Travel-Bot remembers user details (like dietary restrictions, budget, and travel history) to create a seamless, personalized planning experience. The project is optimized for a high-impact demo and easy developer setup.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) - Full Stack (Frontend + API Routes)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Prisma Postgres
- **Auth:** Clerk (Client-side implementation)
- **AI & Memory:** **Backboard.io** + Vercel AI SDK

## Project Conventions

### Code Style

- **Simplicity First:** Prefer readable, self-contained code over complex abstractions.
- **Formatting:** Prettier with standard config.
- **Structure:**
- `app/api/...`: Server-side logic and DB calls.
- `components/...`: UI components (Functional, PascalCase).
- `lib/...`: Shared utilities (DB clients, helper functions).

- **Type Safety:** Strict TypeScript. Use **Zod** for validating API inputs and Environment Variables.

### Architecture Patterns

- **Single-App Monolith:** Entire application lives in `src/app`. No complex monorepo workspaces.
- **Lazy User Sync:** User identity is synchronized from Clerk to Postgres efficiently inside the Chat API route (`api/chat/route.ts`), removing the need for complex external webhooks.
- **Dual-Memory Model:**
  - **Backboard.io:** Handles semantic memory (preferences, chat history, "soft" context).
  - **Postgres:** Handles structured data (User IDs, Saved Itineraries, Account Settings).

### Testing Strategy

- **Strategy:** "Demo-Driven Development." Focus on ensuring the "Happy Path" works flawlessly for the judges.
- **Manual Testing:** Rigorous manual testing of the Login -> Chat -> Save Itinerary flow.
- **Unit Tests:** minimal/optional (only for complex utility functions).

### Git Workflow

- **Main Branch:** `main` (Production/Demo ready).
- **Feature Branches:** `feat/feature-name` for new work.
- **Commits:** Clear and descriptive (e.g., `feat: add itinerary card component`, `fix: mobile layout`).

## Domain Context

- **Persistent Persona:** The bot acts as a proactive travel agent that "knows" the user. It should never ask for the same information twice (e.g., "Are you still vegetarian?").
- **Rich UI Responses:** The bot doesn't just output text; it returns structured data that the frontend renders into Flight Cards and Itinerary Maps.

## Important Constraints

- **Zero-Setup Goal:** The project must be runnable by anyone with `npm install` and a `.env` file. Avoid dependencies that require local software installation (like local Docker containers) if possible.
- **Demo Focus:** Aesthetics and "Magic" moments (instant recall of past details) take priority over handling obscure edge cases.

## External Dependencies

- **Backboard.io:** **(Critical)** Provides the Agent logic and Persistent Memory.
- **Clerk:** User Authentication.
- **Prisma Postgres:** Instant Severless Postgres.
- **Vercel AI SDK:** Streamlines the chat UI and streaming responses.

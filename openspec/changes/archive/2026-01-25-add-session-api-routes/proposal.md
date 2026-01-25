# Change: Add Session Management API Routes

## Why

The application needs endpoints to support multi-session chat functionality for Backboard Travel-Bot. Currently, the database models (User, Session, Message) exist but there are no API routes to manage sessions. Users need the ability to:
- Create multiple trip planning sessions
- Retrieve all their sessions
- Access message history within a session
- Send messages and receive AI-powered responses

This change provides the foundational API layer for the frontend chat interface and establishes the integration pattern with Backboard.io.

## What Changes

- **POST** `/api/sessions` - Create a new empty session with a default title
- **GET** `/api/sessions` - Retrieve all sessions for the authenticated user
- **GET** `/api/sessions/[id]` - Retrieve all messages within a specific session
- **POST** `/api/sessions/[id]/chat` - Send a message and receive a streaming chatbot reply

**Implementation Details:**
- Use Clerk authentication to identify users
- Integrate with Backboard.io for thread management and AI responses
- Return structured responses with proper error handling
- Follow Next.js App Router conventions
- Create database records with Prisma ORM
- Use streaming responses for chat endpoint (Vercel AI SDK pattern)

## Impact

**Affected Specs:**
- `database` - Will need to ensure Session and Message models are properly queried
- `api-routes` - New spec (or capability) defining session management endpoints

**Affected Code:**
- `src/app/api/sessions/route.ts` - Collection endpoints (POST, GET)
- `src/app/api/sessions/[id]/route.ts` - Single session retrieval (GET)
- `src/app/api/sessions/[id]/chat/route.ts` - Chat endpoint with streaming (POST)
- `src/lib/prisma.ts` - Exports singleton Prisma client (existing)
- Prisma schema - Already defines User, Session, Message models

**External Integrations:**
- Clerk for user authentication and identification
- Backboard.io for AI assistant integration and thread management

**Breaking Changes:**
- None - this is purely additive functionality
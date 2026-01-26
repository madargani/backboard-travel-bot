# Change: Integrate Backboard JS SDK

## Why

The current implementation uses raw `fetch` calls to interact with Backboard's REST API, which is brittle, lacks type safety, and requires manual error handling. The Backboard JS SDK provides a cleaner, typed interface for managing threads, assistants, and messages.

## What Changes

- Install `backboard-sdk` package
- Integrate SDK for thread creation in POST `/api/sessions`
- Integrate SDK for message sending in POST `/api/sessions/[id]/chat`
- Integrate SDK for assistant creation when new users are created
- Replace raw `fetch` calls with SDK methods
- Update environment variable documentation for SDK configuration

## Impact

- Affected specs: `api-routes`, `database`
- Affected code:
  - `src/app/api/sessions/route.ts` - session creation
  - `src/app/api/sessions/[id]/chat/route.ts` - chat endpoint
  - `src/lib/auth.ts` - user creation
  - `package.json` - add SDK dependency
- Benefits: Type safety, cleaner code, automatic error handling, better maintainability
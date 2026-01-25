# Change: Add Session and Message Models to Prisma Schema

## Why
The current User model stores thread data as an array, which limits organization and queryability. Adding dedicated Session and Message models enables:
- Better data organization (each session = one trip/conversation thread)
- More granular chat history tracking
- Future features like session management and message filtering
- Cleaner separation between user identity and conversation history

## What Changes
- Add `Session` model to represent individual trip conversations
- Add `Message` model to represent individual chat messages within sessions
- Update `User` model to have many Sessions (replacing `threadIds` array)
- Retain existing User fields: `assistantId`, `name`
- Each Session links to exactly one Backboard `threadId`
- Each Session has many Messages

## Impact
- **Affected specs:** database (schema changes)
- **Affected code:**
  - `prisma/schema.prisma` - Add Session and Message models
  - `src/app/api/chat/route.ts` - Update to create Session/Message records
  - `src/lib/prisma.ts` - Ensure TypeScript types are regenerated
- **Migration:** No data migration needed (fresh deployment)
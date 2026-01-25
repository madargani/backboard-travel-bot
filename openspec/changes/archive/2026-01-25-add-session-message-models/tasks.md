## 1. Update Prisma Schema
- [x] 1.1 Add Session model with fields: id, title, userId, threadId, createdAt
- [x] 1.2 Add Message model with fields: id, role, content, sessionId, createdAt
- [x] 1.3 Update User model to add sessions relation and remove threadIds array
- [x] 1.4 Define relations: User → Session → Message (one-to-many)
- [x] 1.5 Run `npx prisma generate` to update TypeScript types

## 2. Update API Routes
- [ ] 2.1 Update `src/app/api/chat/route.ts` to handle Session creation
- [ ] 2.2 Update chat route to create Message records for user and assistant responses
- [ ] 2.3 Ensure proper error handling for database operations

## 3. Generate and Verify
- [x] 3.1 Run `npx prisma db:push` to apply schema changes
- [x] 3.2 Run `npx prisma generate` to update Prisma Client types
- [x] 3.3 Verify TypeScript compilation succeeds
- [ ] 3.4 Test creating a session and message via API

## 4. Documentation Updates
- [x] 4.1 Update `openspec/specs/database/spec.md` with new model requirements
- [x] 4.2 Add scenarios for Session and Message operations
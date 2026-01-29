# Change: Add Session Rename Feature

## Why
Users currently cannot rename sessions from the default "New Trip" title. This makes it difficult to identify and organize trips, especially when a user has multiple conversations. Adding session renaming improves usability and personalization.

## What Changes
- Add PATCH endpoint at `/api/sessions/[id]` to update session title
- Add rename UI in SessionList component with inline edit capability
- Add input validation for session titles (max length, required)
- Update local state management to reflect renamed sessions in lists

## Impact
- Affected specs:
  - `api-routes/spec.md` (new endpoint for session updates)
  - `frontend/spec.md` (new UI interaction for renaming)
- Affected code:
  - `src/app/api/sessions/[id]/route.ts` (add PATCH handler)
  - `src/components/SessionList.tsx` (add rename UI)
  - `src/app/chat/[id]/page.tsx` (update session title state after rename)
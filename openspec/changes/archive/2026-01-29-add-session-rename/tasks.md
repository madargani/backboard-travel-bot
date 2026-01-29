## Implementation Tasks

### 1. Backend API Endpoint
- [x] 1.1 Add PATCH handler to `src/app/api/sessions/[id]/route.ts`
- [x] 1.2 Implement title validation (required, max 100 characters)
- [x] 1.3 Verify user ownership before allowing update
- [x] 1.4 Return updated session object on success
- [x] 1.5 Return appropriate error codes (400, 403, 404, 401, 500)

### 2. Frontend UI Components
- [x] 2.1 Add rename state management to `SessionList.tsx` (isRenaming, editingSessionId)
- [x] 2.2 Add edit button to each session item (pencil icon)
- [x] 2.3 Add inline input field for editing session title
- [x] 2.4 Implement save functionality on Enter key and blur
- [x] 2.5 Implement cancel functionality on Escape key
- [x] 2.6 Add loading state during API call
- [x] 2.7 Update local session list after successful rename
- [x] 2.8 Add error handling and display error message

### 3. Integration & State Management
- [x] 3.1 Propagate session updates from SessionList to parent components
- [x] 3.2 Refresh session list display after rename
- [x] 3.3 Ensure mobile dropdown reflects updated title

### 4. Testing & Validation
- [x] 4.1 Manual test: Rename session with valid title
- [x] 4.2 Manual test: Attempt rename with empty title (should fail validation)
- [x] 4.3 Manual test: Attempt rename with title > 100 chars (should fail validation)
- [x] 4.4 Manual test: Attempt rename of another user's session (should return 403)
- [x] 4.5 Manual test: Keyboard navigation (Enter to save, Escape to cancel)
- [x] 4.6 Manual test: Click outside while editing (should save)
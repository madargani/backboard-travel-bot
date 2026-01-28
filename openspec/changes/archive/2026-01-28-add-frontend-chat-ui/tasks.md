# Implementation Tasks

**Total steps: 16 (ordered, can be approached in 3 phases)**

## Phase 1: Authentication Setup

- [x] 1.1 Wrap root layout with ClerkProvider
  - File: `src/app/layout.tsx`
  - Import `ClerkProvider` from `@clerk/nextjs`
  - Wrap existing `<html>` structure with `<ClerkProvider>`
  - Configure with necessary props (if any)

- [x] 1.2 Create landing page with SignInButton
  - File: `src/app/page.tsx`
  - Import `SignInButton` from `@clerk/nextjs/components`
  - Replace existing content with centered sign-in button
  - Style with Tailwind for visual hierarchy
  - Add loading state if button redirects on sign-in

- [x] 1.3 Test authentication flow
  - Start dev server: `npm run dev`
  - Visit `http://localhost:3000`
  - Click sign-in button
  - Complete Clerk authentication flow
  - Verify user is authenticated after redirect

## Phase 2: Chat Interface Components

- [x] 2.1 Create components directory
  - Directory: `src/components/`
  - Verify directory exists

- [x] 2.2 Implement SessionList component (sidebar)
  - File: `src/components/SessionList.tsx`
  - Props: `sessions` array, `currentSessionId`, `onSessionSelect` callback
  - Display list of sessions with title and timestamp
  - Highlight active session visually
  - Style with Tailwind (desktop: sidebar, mobile: collapsible)
  - Handle click to switch sessions

- [x] 2.3 Implement MessageList component
  - File: `src/components/MessageList.tsx`
  - Props: `messages` array from `useChat` hook
  - Render user messages on right, assistant on left
  - Style with Tailwind (different colors for roles)
  - Scrollable container with sticky bottom for new messages

- [x] 2.4 Implement ChatInput component
  - File: `src/components/ChatInput.tsx`
  - Props: `handleSubmit` from `useChat` hook, `input` state, `isLoading`
  - Textarea with auto-resize
  - Submit button (disabled when empty or loading)
  - Enter key submits message (Shift+Enter for newline)

- [x] 2.5 Implement ChatInterface component
  - File: `src/components/ChatInterface.tsx`
  - Use `useChat` hook from `@ai-sdk/react`
  - Configure `api` parameter to `/api/sessions/[id]/chat`
  - Integrate MessageList, ChatInput, and SessionList components
  - Layout: Sidebar + Chat Area on desktop, Full-screen on mobile
  - Display loading indicator when streaming
  - Handle error states

- [x] 2.6 Style chat components for responsive design
  - Apply Tailwind mobile-first styling
  - Mobile: Sidebar collapses/toggleable, chat area full-screen with input at bottom
  - Desktop: Fixed sidebar on left, chat area with max-width (e.g., max-w-2xl)
  - Test responsive behavior with browser dev tools

## Phase 3: Integration and Routing

- [x] 3.1 Create chat route structure
  - Directory: `src/app/chat/[id]/page.tsx`
  - Dynamic route for chat session ID

- [x] 3.2 Implement chat page with authentication guard
  - File: `src/app/chat/[id]/page.tsx`
  - Use `useAuth` hook to check authentication
  - Redirect to landing page if not authenticated
  - Load existing session messages on page load
  - Render ChatInterface component

- [x] 3.3 Add redirect from landing page after sign-in
  - Modify `src/app/page.tsx`
  - On successful sign-in, redirect to `/chat/[session-id]`
  - Create new session if user has no sessions (call `/api/sessions`)
  - Use first available session ID for redirect

- [x] 3.4 Test chat flow end-to-end
  - Start dev server: `npm run dev`
  - Sign in via landing page
  - Verify redirect to `/chat/[id]`
  - Send first message
  - Verify user message appears immediately
  - Verify AI response streams character-by-character
  - Verify message saved to database (check Prisma Studio)

- [x] 3.5 Test error scenarios
  - Try accessing `/chat/[non-existent-id]` → should redirect to landing page or show error
  - Try sending empty message → should be blocked
  - Try chat with network disconnected → should show error state

- [x] 3.6 Verify LSP diagnostics and build
  - Run `npm run lint`
  - Fix any lint errors or warnings
  - Run `npm run build`
  - Verify build succeeds without errors
  - Check output console for deprecations or warnings

- [x] 3.7 Mobile viewport testing
  - Use Chrome DevTools device mode
  - Test chat interface on mobile viewport (iPhone, Android)
  - Verify keyboard doesn't overlap input field
  - Verify scrolling works properly

## Dependencies

Most tasks can be done sequentially. Only 2.4 (ChatInterface) depends on 2.2 and 2.3 being complete.

## Parallelizable Work

- 2.2, 2.3, and 2.4 could be done in parallel if multiple developers (but recommended sequential for simplicity)
- All styling tasks can be done alongside component implementation
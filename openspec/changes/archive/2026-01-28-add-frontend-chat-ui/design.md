# Design: Add Frontend Chat UI

## Context

The project has a complete backend with:
- Next.js App Router architecture
- Prisma database with User, Session, Message models
- Clerk authentication middleware configured
- API routes for session management and chat endpoints
- Backboard SDK integration for assistant management

Current state:
- Basic Next.js landing page with minimal styling
- No user-facing chat interface
- Clerk authentication not exposed on frontend
- API routes ready but no UI to consume them

Constraints:
- Zero-setup goal: Must work after `npm install` and environment setup
- Demo focus: UX and "magic" moments (instant recall) take priority over edge cases
- Simplicity first: Prefer vanilla components over complex UI libraries

## Goals / Non-Goals

**Goals:**
- Provide a functional chat interface where users can send messages and receive AI responses
- Enable authentication through Clerk with visible sign-in entry point
- Support real-time streaming of AI responses for perceived speed
- Allow users to view and switch between multiple chat sessions
- Maintain session persistence and message history display
- Responsive design that works on mobile and desktop

**Non-Goals:**
- Rich text editing, markdown rendering, or code syntax highlighting at this stage
- File uploads or image sharing
- Advanced features (search, export, favorites)
- Custom UI styling (stick to Tailwind utility classes)
- Integration testing or automated testing framework setup

## Decisions

### 1. ClerkProvider Configuration

**Decision:** Wrap root layout with `<ClerkProvider>` to enable Clerk authentication throughout the app.

**Rationale:**
- Standard Clerk integration pattern for Next.js App Router
- Provides AuthContext globally via React Context
- Allows `useAuth()` hook access in any component
- Required by all Clerk components like `<SignInButton />`

**Alternative considered:** Wrapping only specific pages or using edge runtime.
- **Rejected:** More complex setup, no clear benefit for this demo.

### 2. Landing Page with SignInButton

**Decision:** Replace current landing page with a Clerk `<SignInButton />` component that redirects authenticated users to the chat interface.

**Rationale:**
- Immediate user entry point for authentication
- Simplifies onboarding (sign in → start chatting)
- Follows Clerk's recommended pattern
- Can be styled with Tailwind to match project aesthetic

**Alternative considered:** Custom sign-in form.
- **Rejected:** Clerk's pre-built components handle all authentication flows, less code.

### 3. Chat Interface Architecture

**Decision:** Use Vercel AI SDK's `useChat` hook for chat state management and streaming.

**Rationale:**
- Built for Next.js and React Server Components
- Handles streaming responses automatically
- Manages optimistic UI updates
- Simple API: `messages`, `input`, `handleSubmit`, `isLoading`
- Integrates with existing API routes seamlessly

**Alternative considered:** Building custom streaming logic with fetch and ReadableStream.
- **Rejected:** More code, higher complexity, `useChat` is proven and well-tested.

### 4. Component Structure

**Decision:** Create minimal component hierarchy:
- `components/ChatInterface.tsx` - Main chat container with message list and input
- `components/MessageList.tsx` - Display messages with role-based styling
- `components/SessionList.tsx` - Sidebar or modal showing saved sessions (optional, can be deferred)

**Rationale:**
- Small, focused components are easy to test and modify
- Single responsibility per component
- Follows project's "simplicity first" convention

**Alternative considered:** Larger monolithic chat component.
- **Rejected:** Harder to maintain and extend over time.

### 5. Integration with API Routes

**Decision:** Use Vercel AI SDK to call `/api/sessions/[id]/chat` endpoint via `api` parameter.

**Rationale:**
- API returns streaming response (text/event-stream)
- Vercel AI SDK handles streaming decoding and parsing
- Automatic message appending to `messages` array
- Loading states handled automatically

**Alternative considered:** Manual fetch and streaming implementation.
- **Rejected:** `useChat` handles edge cases and provides better UX.

### 6. Session Management UI

**Decision:** Implement a sidebar component that displays the user's sessions and allows switching between them.

**Rationale:**
- Sidebar is standard chat app pattern (Discord, Slack, WhatsApp Web)
- Provides easy navigation between trip conversations
- Shows session titles for quick identification
- Can be collapsed on mobile for more screen space

**Sidebar Design:**
- Desktop: Fixed-width sidebar on the left side, showing list of sessions
- Mobile: Collapsible sidebar/hamburger menu to toggle visibility
- Each session item shows title and timestamp
- Active session is visually highlighted
- Clicking a session switches to that session

**Alternative considered:** Session selection modal or dropdown.
- **Rejected:** Sidebar is more visible and accessible for frequent switching. Modal adds clicks.

### 7. Styling Approach

**Decision:** Use Tailwind CSS utility classes only. No component library (shadcn/ui, Material, etc.).

**Rationale:**
- Zero additional dependencies
- Project already uses Tailwind
- Consistent with project's "simplicity first" convention
- Full control over design without UI library overhead

**Alternative considered:** Using shadcn/ui components.
- **Rejected:** Additional setup, not necessary for initial demo. Can add later if needed.

### 8. Responsive Design

**Decision:** Message list scrolls vertically. On mobile, full-screen chat. On desktop, centered container with max-width.

**Rationale:**
- Matches standard chat app UX (WhatsApp, Discord)
- Mobile-first approach is accessible
- Simple implementation with Tailwind responsive prefixes (md:, lg:)

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Clerk authentication not configured correctly | High - users can't sign in | Document environment variables, test sign-in flow early |
| Vercel AI SDK streaming doesn't match API response format | High - broken chat UI | Verify API response format matches SDK expectations, test streaming end-to-end |
| Session ID routing conflicts with existing routes | Medium - routing errors | Use nested dynamic route `/chat/[id]/page.tsx` for chat sessions |
| Mobile UX issues (viewport, keyboard sizing) | Medium - poor mobile experience | Test on mobile viewport (Chrome DevTools device mode), add proper meta tags |
| CORS issues if frontend and API origins differ | Low - won't happen (same origin) | N/A - Next.js handles same-origin automatically |

## Migration Plan

**Phase 1: Authentication Setup**
1. Add `<ClerkProvider>` to `src/app/layout.tsx`
2. Replace landing page with `<SignInButton />` component
3. Test sign-in flow locally

**Phase 2: Chat Interface**
1. Create `src/components/` directory structure
2. Implement `ChatInterface` component with `useChat` hook
3. Integrate with `/api/sessions/[id]/chat` endpoint
4. Test message sending and streaming responses

**Phase 3: Integration**
1. Add redirect from landing page to chat after authentication
2. Style components with Tailwind for responsive design
3. Test end-to-end: Sign in → Session creation → Chat → Response

**Rollback:** Git revert if any phase breaks. APIs routes remain unaffected.

## Open Questions

- Should sessions be auto-created when user first signs in, or only on explicit action?
- Should the landing page show a preview of the chat interface before sign-in?
- Is `/chat/[id]/` routing appropriate, or should chat be on the root page for authenticated users?

**Recommendation:**
- Auto-create session on first chat message (simpler UX)
- Landing page shows sign-in button only (keep it simple)
- Use `/chat/[id]/` routing for explicit session URLs (flexible for future features like sharing)
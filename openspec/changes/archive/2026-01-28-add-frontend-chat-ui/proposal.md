# Change: Add Frontend Chat UI with Clerk and Vercel AI SDK

## Why

The project currently has a complete backend API for session-based chat authentication and message handling via Backboard.io, but lacks a frontend user interface. Users cannot interact with the chat system through a visual interface. A frontend chat UI is needed to demonstrate the persistent memory capabilities and provide a complete user experience.

## What Changes

- **Frontend Authentication**: Wrap the root layout with `<ClerkProvider>` to enable Clerk authentication across the app
- **Landing Page**: Add `<SignInButton />` component to the landing page for user entry point
- **Chat UI Components**: Create chat interface components with message display and input handling
- **Vercel AI SDK Integration**: Use Vercel AI SDK hooks (`useChat`) for streaming AI responses from the chat API
- **Session Management**: Create UI for viewing and selecting chat sessions
- **Real-time Streaming**: Implement streaming chat responses using Vercel AI SDK's streaming capabilities
- **Responsive Design**: Ensure chat UI works on both desktop and mobile devices

**BREAKING**: None - this is a new capability layer that complements existing API routes

## Impact

- **Affected specs**:
  - `frontend` (new capability - chat UI and authentication components)
  - `project-structure` (MODIFIED - adds `components/` directory structure)

- **Affected code**:
  - `src/app/layout.tsx` - add ClerkProvider wrapper
  - `src/app/page.tsx` - replace with SignInButton landing page
  - `src/components/` - new directory for chat UI components
  - `src/lib/` - new file for Vercel AI SDK client configuration

- **Dependencies**: No new npm dependencies required (Clerk, Vercel AI SDK already installed)
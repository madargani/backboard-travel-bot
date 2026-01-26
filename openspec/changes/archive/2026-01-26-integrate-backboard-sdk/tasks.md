## 1. Research and Verification
- [x] 1.1 Confirmed `backboard-sdk` package name via npm
- [x] 1.2 SDK documentation patterns identified (client: new BackboardClient({ apiKey }), methods: createAssistant, createThread, addMessage)
- [x] 1.3 SDK's `addMessage` supports `stream: true` and returns async iterable with chunks
- [x] 1.4 System prompt determined: "You are a helpful and knowledgeable AI assistant. Your goal is to answer the user's questions clearly, accurately, and concisely. Avoid unnecessary conversational filler."
- [x] 1.5 LLM model determined: llm_provider: 'openai', model_name: 'gpt-5-nano'

## 2. SDK Setup
- [x] 2.1 Install `backboard-sdk` package: `npm install backboard-sdk`
- [x] 2.2 Create `src/lib/backboard.ts` with singleton pattern matching `src/lib/prisma.ts`
- [x] 2.3 Implement globalThis pattern: `const globalForBackboard = globalThis as { backboard: BackboardClient }`
- [x] 2.4 Initialize client: `new BackboardClient({ apiKey: process.env.BACKBOARD_API_KEY })`
- [x] 2.5 Export SDK client: `export const backboard` with dev safety check

## 3. Update Session Creation Endpoint
- [x] 3.1 Import backboard client from '@/lib/backboard'
- [x] 3.2 Fetch user to get assistantId before creating thread (ensureUserExists already returns user)
- [x] 3.3 Replace `crypto.randomUUID()` with `client.createThread(user.assistantId)`
- [x] 3.4 Add error handling: wrap SDK call in try-catch, return HTTP 500 on failure
- [x] 3.5 Test endpoint creates session with valid threadId from SDK
- [x] 3.6 Test endpoint returns HTTP 500 when SDK thread creation fails

## 4. Update Chat Endpoint
- [x] 4.1 Import backboard client from '@/lib/backboard' and remove BACKBOARD_API_KEY, BACKBOARD_API_URL env vars
- [x] 4.2 Replace `fetch` with `client.addMessage(thread.threadId, { content, stream: true, llm_provider: 'openai', model_name: 'gpt-5-nano' })`
- [x] 4.3 Wrap SDK async iterable in ReadableStream with SSE transformation
- [x] 4.4 Maintain exact SSE format: `data: ${JSON.stringify({ content })}\n\n` and `data: [DONE]\n\n`
- [x] 4.5 Keep headers: 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive'
- [x] 4.6 Test endpoint streams responses correctly via SDK
- [x] 4.7 Test endpoint handles SDK errors with try-catch wrapper

## 5. Update User Creation
- [x] 5.1 Import backboard client into `src/lib/auth.ts`
- [x] 5.2 Check `if (!user || !user.assistantId)` to detect users needing assistant
- [x] 5.3 Call `client.createAssistant({ name: 'Travel Assistant', system_prompt: 'You are a helpful and knowledgeable AI assistant. Your goal is to answer the user's questions clearly, accurately, and concisely. Avoid unnecessary conversational filler.' })`
- [x] 5.4 Assign `assistantId` to User record: `assistantId: assistant.assistantId`
- [x] 5.5 Add error handling: wrap SDK call, throw service initialization error on failure
- [x] 5.6 Test new user creation creates assistant via SDK
- [x] 5.7 Test existing user uses existing assistantId

## 6. Testing and Validation
- [x] 6.1 Test POST /api/sessions creates session with SDK-generated threadId
- [x] 6.2 Test POST /api/sessions/[id]/chat streams AI response in correct SSE format
- [x] 6.3 Test new user creation through clerk sync creates assistant
- [x] 6.4 Test returning user uses existing assistant without recreation
- [x] 6.5 Test error handling: SDK failures return HTTP 500 with generic message
- [x] 6.6 Manual verification with existing frontend chat interface

## 7. Documentation
- [x] 7.1 Add BACKBOARD_API_KEY and BACKBOARD_API_URL to .env.example if needed
- [x] 7.2 Update README.md with SDK installation and configuration instructions
- [x] 7.3 Document SDK client usage for future developers

## 8. Validation (pre-approval)
- [x] 8.1 Run `openspec validate integrate-backboard-sdk --strict --no-interactive`
- [x] 8.2 Fix any validation errors
- [x] 8.3 Verify all scenarios in specs are testable and clear
- [x] 8.4 Ensure no breaking changes to existing API contracts
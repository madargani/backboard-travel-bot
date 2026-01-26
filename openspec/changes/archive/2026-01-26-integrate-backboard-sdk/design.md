# Design: Integrate Backboard JS SDK

## Context

The current implementation uses raw HTTP `fetch` calls to interact with Backboard's REST API. This approach works but has several drawbacks:

- No type safety - API response structures must be manually verified
- Brittle error handling - relies on HTTP status codes and manual parsing
- Code duplication - similar fetch patterns across multiple endpoints
- Maintenance burden - API changes require manual updates throughout codebase

The Backboard JS SDK offers a cleaner alternative by providing:
- TypeScript types for all API responses
- Automatic error handling with typed exceptions
- Helper methods for common operations (create thread, send message, create assistant)
- Consistent patterns across SDK versions

## Goals / Non-Goals

**Goals:**
- Integrate Backboard JS SDK for all Backboard API interactions
- Maintain backward compatibility with existing API behavior
- Improve type safety and error handling
- Simplify code by removing manual fetch logic
- Add proper SDK configuration and initialization

**Non-Goals:**
- Changing the external API contract (endpoints remain same)
- Modifying database schema (threadId, assistantId fields stay)
- Adding new features beyond SDK integration
- Changing streaming behavior for chat endpoint

## Decisions

### 1. SDK Initialization Strategy

**Decision:** Create a singleton SDK client in `src/lib/backboard.ts` initialized from `BACKBOARD_API_KEY` environment variable using `globalThis` pattern.

**Reasoning:**
- Single instance ensures consistent configuration across the app
- Uses existing `BACKBOARD_API_KEY` env var from `.env`
- Singleton pattern prevents multiple client creation overhead and hot-reload issues
- Follows the existing Prisma client singleton pattern in `src/lib/prisma.ts`

**SDK Initialization Pattern:**
```typescript
import { BackboardClient } from 'backboard-sdk';

const globalForBackboard = globalThis as unknown as {
  backboard: BackboardClient | undefined;
};

export const backboard = globalForBackboard.backboard ?? new BackboardClient({
  apiKey: process.env.BACKBOARD_API_KEY,
});

if (process.env.NODE_ENV !== 'production') {
  globalForBackboard.backboard = backboard;
}
```

**Alternatives considered:**
- Create client per request: Overhead of repeated initialization
- Pass client from middleware: Adds unnecessary complexity to middleware to middleware

### 2. Error Handling Approach

**Decision:** Wrap SDK errors and throw HTTP-appropriate errors in handlers, maintaining existing error response structure.

**Reasoning:**
- SDK provides typed errors; we map these to HTTP status codes
- Existing 401/403/404/500 error handling patterns remain unchanged
- Frontend clients continue to receive consistent error formats

**Alternatives considered:**
- Bubble SDK exceptions directly: Exposes implementation details to client
- Supress SDK errors: loses valuable debugging information

### 3. Streaming with SDK

**Decision:** Use SDK's `addMessage()` with `stream: true` parameter, then transform the async iterable to SSE format using `ReadableStream`.

**Reasoning:**
- SDK returns an async iterable that yields chunks (e.g., `{ type: 'content_streaming', content: '...' }`)
- Must transform to SSE format: `data: ${JSON.stringify(chunk)}\n\n`
- Existing SSE response format must be preserved (headers, chunk formatting)
- Message saving pattern (save user message, save assistant message after stream) remains unchanged

**SDK Streaming Pattern:**
```typescript
const stream = await client.addMessage(thread.threadId, {
  content: 'Hello!',
  stream: true,
  llm_provider: 'openai',
  model_name: 'gpt-5-nano',
});

for await (const chunk of stream) {
  if (chunk.type === 'content_streaming') {
    process.stdout.write(chunk.content || '');
  }
}
```

**SSE Transformation Pattern:**
```typescript
const readableStream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder();
    try {
      for await (const chunk of stream) {
        if (chunk.type === 'content_streaming' && chunk.content) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    } finally {
      controller.close();
    }
  },
});
```

**Alternatives considered:**
- Use `stream: false` and wait for complete response: Worse UX, no real-time responses
- Return raw async iterable: Breaking change for frontend

### 4. User Creation Timing

**Decision:** Create Backboard assistant during user sync in `ensureUserExists()` function when assistantId is empty.

**Reasoning:**
- Current implementation sets assistantId to empty string: `assistantId: ""` in `src/lib/auth.ts`
- Check if `!user || !user.assistantId` to detect users needing assistant creation
- Create on-demand when user first makes a request to API (lazy initialization)
- Session creation now requires assistantId to call `client.createThread(assistantId)`

**SDK Assistant Creation Pattern:**
```typescript
const assistant = await client.createAssistant({
  name: 'Travel Assistant',
  system_prompt: 'You are a helpful and knowledgeable AI assistant. Your goal is to answer the user\'s questions clearly, accurately, and concisely. Avoid unnecessary conversational filler.',
});

// Store assistant.assistantId in User model
```

**Alternatives considered:**
- Create assistant in Clerk webhook: Adds infrastructure complexity (webhook server)
- Create assistant on session creation: Delayed assistant creation makes session creation slower

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
<tool_call>edit<arg_key>filePath</arg_key><arg_value>/home/madargani/Documents/projects/backboard-travel-bot/openspec/changes/integrate-backboard-sdk/design.md
| Streaming format incompatible with frontend | Low | High | Test with existing frontend, match SSE format exactly |
| SDK constructor signature changes | Low | Medium | Pin SDK version in package.json |
| Missing MODEL_NAME causes errors | Low | Medium | Default to 'gpt-5-nano' in code |

## Migration Plan

1. **Add SDK dependency:** Install `backboard-sdk` package
2. **Create SDK client:** Implement `src/lib/backboard.ts` singleton
3. **Update session creation:** Replace `crypto.randomUUID()` with SDK `createThread(assistantId)`
4. **Update chat endpoint:** Replace `fetch` with SDK `addMessage(threadId, { content, llm_provider, model_name, stream })`
5. **Update user creation:** Add assistant creation logic with `createAssistant({ name, system_prompt })` in `ensureUserExists()`
6. **Test thoroughly:** Verify all API endpoints work unchanged
7. **Update documentation:** Add SDK env vars to README/.env.example

**SDK Usage Pattern:**
```typescript
// Client initialization
const client = new BackboardClient({ apiKey: process.env.BACKBOARD_API_KEY });

// Assistant creation (for new users)
const assistant = await client.createAssistant({
  name: 'Travel Assistant',
  system_prompt: 'You are a helpful and knowledgeable AI assistant. Your goal is to answer the user\'s questions clearly, accurately, and concisely. Avoid unnecessary conversational filler.'
});

// Thread creation (for new sessions)
const thread = await client.createThread(assistant.assistantId);

// Message sending (for chat - streaming and non-streaming)
const response = await client.addMessage(thread.threadId, {
  content: '...',
  llm_provider: 'openai',
  model_name: 'gpt-5-nano',
  stream: true
});
```

**Rollback:** Git revert if critical issues discovered; database schema unchanged so no data migration needed.

## Open Questions

None remaining. System prompt and model configuration determined.
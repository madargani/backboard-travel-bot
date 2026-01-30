## Context

The Backboard SDK supports tool calls via the `tool_submit_required` stream chunk type. When the agent needs to use a tool, it sends back chunks with `tool_calls` containing function names and arguments. The application must then:
1. Parse the function name and arguments
2. Execute the corresponding function
3. Submit the outputs back to Backboard
4. Continue streaming the response

Currently, the codebase lacks infrastructure to:
- Register tools in a structured way
- Route tool calls to their implementations
- Handle errors and edge cases in tool execution

## Goals / Non-Goals

**Goals:**
- Provide a simple, extensible system for adding new tools
- Handle tool call events in the chat API
- Support the pattern from the reference code (tool execution → output submission)
- Include error handling and validation
- Include a mock weather tool (always sunny) to demonstrate the pattern

**Non-Goals:**
- Implementing production tools (real weather APIs, flights, hotels) - those come in separate changes
- Complex tool scheduling or parallel execution
- Tool result caching or memoization

## Design Decisions

### 1. Tool Registration Pattern
- **Decision:** Use a Map-based registry with function name as key
- **Rationale:** Simple, O(1) lookup, easy to add/register new tools
- **Alternative:** Class-based with decorator (more complex, not needed for simple case)

### 2. Tool Signature
- **Decision:** Tools are functions that accept `arguments` object and return `output` (any JSON-serializable type)
- **Rationale:** Matches the reference pattern where `toolOutputs.push({ tool_call_id: tc.id, output: JSON.stringify(weatherData) })`
- **Alternative:** More complex return types (not worth the overhead)

### 3. Error Handling
- **Decision:** Wrap tool execution in try-catch, return error as tool output
- **Rationale:** Prevents stream interruption, allows agent to retry or inform user
- **Alternative:** Throw errors and break stream (poor UX)

### 4. Tool Location
- **Decision:** Create `src/lib/tools.ts` for registry and executor; individual tools in `src/lib/tools/*.ts`
- **Rationale:** Keeps tool logic separate from API routes, makes tools easy to find
- **Alternative:** Put all tools in one file (becomes messy with many tools)

## Risks / Trade-offs

- **Risk:** Tool execution blocks the stream until completion
  - **Mitigation:** Keep tools fast (< 1-2s), for slow tools consider async background execution in future
- **Risk:** Malformed tool outputs cause issues downstream
  - **Mitigation:** Validate tool outputs before submission
- **Trade-off:** Simple synchronous tool execution vs complex async orchestration
  - **Decision:** Synchronous is fine for initial implementation, can evolve later

## Implementation Approach

1. **Create Tool Registry (`src/lib/tools.ts`)**:
   - `ToolFunction` type
   - `registerTool(name, description, parameters, function)`
   - `executeTool(name, arguments)` → catches errors, returns JSON string
   - `getTool(name)` → returns tool metadata

2. **Update Chat API (`src/app/api/sessions/[id]/chat/route.ts`)**:
   - Watch for `tool_submit_required` chunk type
   - Extract tool calls from chunk
   - Execute each tool via registry
   - Collect outputs
   - Call `backboard.submitToolOutputs(threadId, runId, outputs, stream: true)`
   - Continue streaming

3. **Mock Weather Tool (`src/lib/tools/weather.ts`)**:
   - Implement `get_current_weather` tool
   - Accept `location` parameter (string, required)
   - Always return sunny weather with random temperature 65-75°F
   - Auto-register on module load
   - Demonstrates pattern for tool authors

4. **Update Auth Tool Passing (`src/lib/auth.ts`)**:
   - Import tool registry
   - Convert registry tools to Backboard Tool format
   - Pass tools to `createAssistant()`

## Open Questions

- Should we support tool composition (tools calling other tools)?
  - Answer: Not needed initially, can add later
- Should we include tool execution logs?
  - Answer: Yes, useful for debugging, but keep minimal
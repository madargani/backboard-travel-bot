# Change: Add Tools Infrastructure

## Why
The travel bot currently only supports text-based conversations. To enable the bot to perform actions like fetching weather data, searching flights, or checking hotel availability, we need a base infrastructure for registering and executing tools that the agent can call during conversations.

## What Changes
- Add a tool registration system that allows easy addition of new tools
- Create tool executor that handles function execution when requested by the agent
- Integrate tool execution into the chat API to handle tool call events
- Provide base patterns for error handling and output submission

## Impact
- **Affected specs:**
  - New spec: `tools` (tool registration and execution)
- **Affected code:**
  - `src/lib/auth.ts` - `ensureUserExists()` needs to pass tools to `createAssistant()`
  - `src/app/api/sessions/[id]/chat/route.ts` - needs tool execution handling logic
  - New: `src/lib/tools.ts` - tool registration and executor
  - New: `src/lib/tools/` - directory for individual tool implementations
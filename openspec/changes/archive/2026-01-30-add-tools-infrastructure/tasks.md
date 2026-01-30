## 1. Create Tool Registry and Executor
- [x] 1.1 Create `src/lib/tools.ts` with core types and interfaces
  - Define `ToolFunction` type: `(args: any) => any`
  - Define `ToolRegistry` interface with register, execute, and get methods
  - Define `ToolDefinition` interface with name, description, parameters, and function
- [x] 1.2 Implement tool registry Map to store tools by name
- [x] 1.3 Implement `registerTool` function
  - Validate tool name uniqueness
  - Store tool definition in registry
  - Return tool metadata
- [x] 1.4 Implement `executeTool` function
  - Look up tool by name
  - Execute tool function with arguments
  - Wrap in try-catch for error handling
  - Return JSON string of result or error
- [x] 1.5 Implement `getTool` function for querying tool metadata
- [x] 1.6 Add validation for tool outputs to ensure JSON serializability

## 2. Update Auth to Pass Tools to Assistant
- [x] 2.1 Review `src/lib/auth.ts` to understand current assistant creation
- [x] 2.2 Import tool registry getTool function
- [x] 2.3 Add function to convert registry tools to Backboard Tool format
- [x] 2.4 Modify `ensureUserExists()` to pass tools array to `createAssistant()`
- [x] 2.5 Ensure tools are only passed when tools registry has registered tools

## 3. Update Chat API for Tool Handling
- [x] 2.1 Review `src/app/api/sessions/[id]/chat/route.ts` to understand current stream handling
- [x] 2.2 Import tool registry and executor into chat route
- [x] 2.3 Add handling for `tool_submit_required` chunk type in stream loop
- [x] 2.4 Extract tool_calls from chunk (name, arguments, id)
- [x] 2.5 Execute each tool call using executor
- [x] 2.6 Collect tool outputs with tool_call_id mapping
- [x] 2.7 Call `backboard.submitToolOutputs` with collected outputs and stream: true
- [x] 2.8 Tool output submission should continue streaming the final response

## 4. Create Example/Demo Tool
- [x] 3.1 Create `src/lib/tools/weather.ts` as a mock weather tool
  - Define tool following the OpenAPI function schema format
  - Implement mock function that always returns sunny weather
  - Accept `location` parameter (string, required)
  - Return structured object with: temperature, condition, location
  - Generate random temperature between 65-75°F
  - Always set condition to "Sunny"
  - Register the tool on module load
- [x] 3.2 Add comprehensive comments in weather tool explaining the pattern for new tool authors
- [x] 3.3 Ensure weather tool follows the expected response format

## 5. Integration and Testing
- [x] 5.1 Test tool registration system
  - Register multiple tools
  - Attempt duplicate registration (should fail gracefully)
  - Query tool metadata
- [x] 5.2 Test tool execution paths
  - Execute tool with valid arguments
  - Execute tool with invalid arguments
  - Execute tool that throws error
  - Execute unknown tool
- [x] 5.3 Test assistant creation with tools
  - Create new user and verify tools are passed to createAssistant
  - Verify assistant has tools attached
- [x] 5.4 Test end-to-end flow with chat API
  - Start a conversation
  - Trigger a tool call via agent (or simulate)
  - Verify tool execution
  - Verify output submission
  - Verify continued streaming
- [x] 5.5 Test error scenarios
  - Network errors (if tool makes API calls)
  - Timeout scenarios
  - Malformed tool outputs
- [x] 5.6 Manual testing with Backboard client (if available)
  - Create assistant with tools
  - Send message that triggers tool
  - Verify tool runs correctly

## 6. Documentation
- [x] 6.1 Add JSDoc comments to all exported functions in `tools.ts`
- [x] 6.2 Create README in `src/lib/tools/` explaining tool creation pattern
- [x] 6.3 Document error handling behavior and best practices
- [x] 6.4 Update inline comments in auth.ts to explain tool passing
- [x] 6.5 Update inline comments in chat route to explain tool handling

## 7. Validation
- [x] 7.1 Run TypeScript compiler to ensure no type errors
- [x] 7.2 Run ESLint to check code quality
- [x] 7.3 Run `openspec validate add-tools-infrastructure --strict --no-interactive`
- [x] 7.4 Verify all scenarios from spec.md are covered by implementation
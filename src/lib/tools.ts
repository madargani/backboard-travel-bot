/**
 * Tool Registry and Executor
 *
 * Provides infrastructure for registering and executing tools that the agent can call.
 */

/**
 * ToolFunction represents a function that implements a tool.
 * It accepts arguments object and returns any JSON-serializable output.
 */
export type ToolFunction = (args: any) => any;

/**
 * ToolDefinition describes a tool's metadata and implementation.
 */
export interface ToolDefinition {
  /** Unique name of the tool */
  name: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** JSON Schema for the tool's parameters */
  parameters: Record<string, any>;
  /** The function that implements the tool */
  function: ToolFunction;
}

/**
 * ToolRegistry manages tool registration and execution.
 * Uses a Map for O(1) lookup by tool name.
 */
class ToolRegistry {
  private registry: Map<string, ToolDefinition> = new Map();

  /**
   * Register a tool for use.
   * @param name - Unique name of the tool
   * @param description - Human-readable description
   * @param parameters - JSON Schema for parameters
   * @param fn - Function that implements the tool
   * @returns The tool definition
   * @throws Error if a tool with this name is already registered
   */
  registerTool(
    name: string,
    description: string,
    parameters: Record<string, any>,
    fn: ToolFunction,
  ): ToolDefinition {
    if (this.registry.has(name)) {
      throw new Error(`Tool "${name}" is already registered`);
    }

    const tool: ToolDefinition = {
      name,
      description,
      parameters,
      function: fn,
    };

    this.registry.set(name, tool);
    return tool;
  }

  /**
   * Execute a tool by name with the given arguments.
   * @param name - Name of the tool to execute
   * @param args - Arguments to pass to the tool function
   * @returns JSON string of the tool output or error message
   */
  executeTool(name: string, args: any): string {
    const tool = this.registry.get(name);

    if (!tool) {
      return JSON.stringify({
        error: `Unknown tool: ${name}`,
      });
    }

    try {
      const output = tool.function(args);

      // Validate output is JSON-serializable
      const jsonOutput = JSON.stringify(output);
      JSON.parse(jsonOutput); // Verify it can be parsed back

      return jsonOutput;
    } catch (error: any) {
      return JSON.stringify({
        error: `Tool execution failed: ${error.message}`,
      });
    }
  }

  /**
   * Get tool metadata by name.
   * @param name - Name of the tool
   * @returns Tool definition or undefined if not found
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.registry.get(name);
  }

  /**
   * Get all registered tools.
   * @returns Array of all tool definitions
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * Check if a tool is registered.
   * @param name - Name of the tool
   * @returns True if registered, false otherwise
   */
  hasTool(name: string): boolean {
    return this.registry.has(name);
  }
}

// Global singleton instance
export const registry = new ToolRegistry();

/**
 * Register a tool. Convenience function that wraps the registry method.
 */
export function registerTool(
  name: string,
  description: string,
  parameters: Record<string, any>,
  fn: ToolFunction,
): ToolDefinition {
  return registry.registerTool(name, description, parameters, fn);
}

/**
 * Execute a tool. Convenience function that wraps the registry method.
 */
export function executeTool(name: string, args: any): string {
  return registry.executeTool(name, args);
}

/**
 * Get a tool. Convenience function that wraps the registry method.
 */
export function getTool(name: string): ToolDefinition | undefined {
  return registry.getTool(name);
}

/**
 * Get all tools. Convenience function that wraps the registry method.
 */
export function getAllTools(): ToolDefinition[] {
  return registry.getAllTools();
}


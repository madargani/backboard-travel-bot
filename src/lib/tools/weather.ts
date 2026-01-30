import { registerTool } from "../tools";

function getCurrentWeather(args: { location: string }) {
  const temperature = Math.floor(Math.random() * (75 - 65 + 1)) + 65;
  return {
    temperature,
    unit: "Fahrenheit",
    condition: "Sunny",
    location: args.location,
  };
}

registerTool(
  "get_current_weather",
  "Get the current weather for a location. Always returns sunny weather for demo purposes.",
  {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city and state, e.g., San Francisco, CA",
      },
    },
    required: ["location"],
  },
  getCurrentWeather
);
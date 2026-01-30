import "dotenv/config";
import Amadeus from "amadeus";

let amadeusClient: Amadeus | null = null;
let initializationError: string | null = null;

function getAmadeusClient(): Amadeus {
  if (initializationError) {
    throw new Error(initializationError);
  }

  if (!amadeusClient) {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    const missing: string[] = [];
    if (!clientId) missing.push("AMADEUS_CLIENT_ID");
    if (!clientSecret) missing.push("AMADEUS_CLIENT_SECRET");

    if (missing.length > 0) {
      initializationError =
        `Missing required Amadeus environment variables: ${missing.join(", ")}. ` +
        `Please set these in your .env file. ` +
        `Get your credentials at: https://developers.amadeus.com/`;
      throw new Error(initializationError);
    }

    amadeusClient = new Amadeus({
      clientId: clientId!,
      clientSecret: clientSecret!,
      hostname: "test",
    });
  }

  return amadeusClient;
}

export const amadeus = new Proxy({} as Amadeus, {
  get(_, prop) {
    const client = getAmadeusClient();
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export interface AmadeusToolResponse<T> {
  success: boolean;
  results?: T[];
  count?: number;
  error?: string;
}

export function successResponse<T>(results: T[]): AmadeusToolResponse<T> {
  return {
    success: true,
    results,
    count: results.length,
  };
}

export function errorResponse(message: string): AmadeusToolResponse<never> {
  return {
    success: false,
    error: message,
  };
}

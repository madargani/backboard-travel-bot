import { BackboardClient } from "backboard-sdk";

const globalForBackboard = globalThis as unknown as {
  backboard: BackboardClient | undefined;
};

export const backboard = globalForBackboard.backboard ?? new BackboardClient({
  apiKey: process.env.BACKBOARD_API_KEY!,
});

if (process.env.NODE_ENV !== "production") {
  globalForBackboard.backboard = backboard;
}
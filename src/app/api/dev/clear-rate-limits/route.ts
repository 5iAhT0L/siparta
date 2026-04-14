/**
 * DEVELOPMENT ONLY: Clear all login rate limits
 * This endpoint helps during development when you hit rate limits
 */
import { jsonOk } from "@/lib/api-helpers";
import { clearAllRateLimits } from "@/lib/api-helpers";

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not available in production", { status: 403 });
  }

  clearAllRateLimits();
  return jsonOk({ message: "Rate limits cleared" });
}

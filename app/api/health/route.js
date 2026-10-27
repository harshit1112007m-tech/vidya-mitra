export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * GET /api/health
 * Checks server health and whether GEMINI_API_KEY environment variable is configured.
 */
export async function GET() {
  try {
    const keyLoaded = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0
    );

    return Response.json(
      {
        ok: true,
        keyLoaded,
        model: process.env.MODEL_NAME || "gemini-2.5-flash",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: "Health check failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

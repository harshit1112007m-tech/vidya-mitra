import { generateGeminiContent } from "@/lib/gemini";
import { getSummarizeSystemPrompt } from "@/lib/prompts";

export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_CHAR_LIMIT = 20000;

/**
 * POST /api/summarize
 * Notes Summarizer: Takes raw text or extracted PDF text, returns 5-7 key bullets,
 * important terms, and a one-paragraph summary in the chosen regional language.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { text, language = "gu", subject = "Computer Science", difficulty = "Intermediate" } = body;

    const trimmedText = (text || "").trim();
    if (!trimmedText) {
      return Response.json({ error: "Please provide notes or document text to summarize." }, { status: 400 });
    }

    if (trimmedText.length < 30) {
      return Response.json({ error: "The provided text is too short to generate a meaningful summary." }, { status: 400 });
    }

    // Cap at 20,000 characters to stay well within Vercel's payload limit and model context budget
    const cappedText = trimmedText.slice(0, MAX_CHAR_LIMIT);

    const systemPrompt = getSummarizeSystemPrompt({ language, subject, difficulty });
    const userPrompt = `Please summarize the following student notes:\n\n---\n${cappedText}\n---`;

    const summary = await generateGeminiContent({
      userPrompt,
      systemPrompt,
      jsonMode: false,
    });

    return Response.json({ summary }, { status: 200 });
  } catch (error) {
    console.error("[api/summarize] Error:", error);
    const status = error.statusCode || 500;
    const message = error.message || "Failed to generate summary. Please try again.";
    return Response.json({ error: message }, { status });
  }
}

import { generateGeminiContent } from "@/lib/gemini";
import { getExplainSystemPrompt } from "@/lib/prompts";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/explain
 * Ask a Doubt: Generates conversational answers in Gujarati, Hindi, or English
 * with real-life analogies and technical terms preserved in English.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { message, messages = [], language = "gu", subject = "DBMS", difficulty = "Beginner" } = body;

    // Validate prompt
    const userMessage = (message || (messages.length > 0 ? messages[messages.length - 1]?.text : "") || "").trim();
    if (!userMessage) {
      return Response.json({ error: "Please provide a question or doubt to explain." }, { status: 400 });
    }

    if (userMessage.length > 4000) {
      return Response.json({ error: "Question is too long (maximum 4,000 characters allowed)." }, { status: 400 });
    }

    // Build context with the last 6 messages
    const recentMessages = Array.isArray(messages) ? messages.slice(-6) : [];
    let formattedContext = "";

    if (recentMessages.length > 0) {
      formattedContext = "CONVERSATION HISTORY:\n" + recentMessages
        .map((m) => `${m.role === "user" ? "Student" : "Vidya Mitra"}: ${m.text}`)
        .join("\n\n") + "\n\n";
    }

    const fullUserPrompt = `${formattedContext}CURRENT STUDENT QUESTION (${subject} - ${difficulty}):\n${userMessage}`;
    const systemPrompt = getExplainSystemPrompt({ language, subject, difficulty });

    const reply = await generateGeminiContent({
      userPrompt: fullUserPrompt,
      systemPrompt,
      jsonMode: false,
    });

    return Response.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("[api/explain] Error:", error);
    const status = error.statusCode || 500;
    const message = error.message || "Failed to generate explanation. Please try again.";
    return Response.json({ error: message }, { status });
  }
}

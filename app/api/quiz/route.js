import { generateGeminiContent } from "@/lib/gemini";
import { getQuizSystemPrompt } from "@/lib/prompts";

export const maxDuration = 60;
export const runtime = "nodejs";

function cleanJsonText(raw) {
  let cleaned = (raw || "").trim();
  // Remove markdown code fences if model included them
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return cleaned;
}

function validateQuizShape(parsed, targetCount) {
  if (!parsed || !Array.isArray(parsed.questions)) return false;
  const list = parsed.questions;
  // Allow slight flexibility if model returned >= targetCount, but must have at least targetCount
  if (list.length < targetCount) return false;

  for (let i = 0; i < targetCount; i++) {
    const q = list[i];
    if (!q || typeof q.question !== "string" || q.question.trim().length === 0) return false;
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    if (q.options.some((opt) => typeof opt !== "string" || opt.trim().length === 0)) return false;
    if (typeof q.correctIndex !== "number" || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
      return false;
    }
    if (typeof q.explanation !== "string" || q.explanation.trim().length === 0) return false;
  }
  return true;
}

/**
 * POST /api/quiz
 * Generates an interactive multiple-choice quiz in the target regional language.
 * Enforces strict JSON shape and retries once on model parse failure.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { topic, count = 5, language = "gu", subject = "DBMS", difficulty = "Beginner" } = body;

    const trimmedTopic = (topic || "").trim();
    if (!trimmedTopic) {
      return Response.json({ error: "Please enter a quiz topic (e.g. Normalization, B-Tree, TCP/IP)." }, { status: 400 });
    }

    const targetCount = Number(count) === 10 ? 10 : 5;
    const systemPrompt = getQuizSystemPrompt({ language, subject, difficulty, count: targetCount });
    const userPrompt = `Create a ${targetCount}-question multiple-choice quiz on topic: "${trimmedTopic}" for subject "${subject}" at ${difficulty} level.`;

    let parsedResult = null;
    let attempt = 0;

    // Retry loop: try up to 2 times (initial + 1 retry on failure)
    while (attempt < 2 && !parsedResult) {
      attempt++;
      try {
        const rawText = await generateGeminiContent({
          userPrompt: attempt === 1 ? userPrompt : `${userPrompt}\nNote: Must be strict valid JSON matching {"questions": [...]}, no markdown backticks.`,
          systemPrompt,
          jsonMode: true,
        });

        const cleaned = cleanJsonText(rawText);
        const parsed = JSON.parse(cleaned);

        if (validateQuizShape(parsed, targetCount)) {
          // Normalize to exactly targetCount items
          parsedResult = {
            questions: parsed.questions.slice(0, targetCount).map((q) => ({
              question: q.question.trim(),
              options: q.options.map((opt) => String(opt).trim()),
              correctIndex: q.correctIndex,
              explanation: q.explanation.trim(),
            })),
          };
          break;
        } else {
          console.warn(`[api/quiz] Shape validation failed on attempt ${attempt}`);
        }
      } catch (genError) {
        // If it's a rate limit or API key error, don't waste retries
        if (genError.statusCode === 429 || genError.statusCode === 500) {
          throw genError;
        }
        console.warn(`[api/quiz] Attempt ${attempt} failed with error:`, genError?.message);
      }
    }

    if (!parsedResult) {
      return Response.json(
        { error: "AI returned an invalid response, please try again" },
        { status: 502 }
      );
    }

    return Response.json(parsedResult, { status: 200 });
  } catch (error) {
    console.error("[api/quiz] Error:", error);
    const status = error.statusCode || 500;
    const message = error.message || "Failed to generate quiz. Please try again.";
    return Response.json({ error: message }, { status });
  }
}

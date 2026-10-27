import { generateGeminiContent } from "@/lib/gemini";
import { getFlashcardsSystemPrompt } from "@/lib/prompts";

export const maxDuration = 60;
export const runtime = "nodejs";

const CARD_COUNT = 8;

function cleanJsonText(raw) {
  let cleaned = (raw || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return cleaned;
}

function validateCardsShape(parsed) {
  if (!parsed || !Array.isArray(parsed.cards)) return false;
  if (parsed.cards.length < CARD_COUNT) return false;

  for (let i = 0; i < CARD_COUNT; i++) {
    const card = parsed.cards[i];
    if (!card || typeof card.front !== "string" || card.front.trim().length === 0) return false;
    if (typeof card.back !== "string" || card.back.trim().length === 0) return false;
  }
  return true;
}

/**
 * POST /api/flashcards
 * Generates 8 interactive study flashcards for quick revision.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { topic, language = "gu", subject = "DSA", difficulty = "Intermediate" } = body;

    const trimmedTopic = (topic || "").trim();
    if (!trimmedTopic) {
      return Response.json({ error: "Please enter a topic for the flashcards (e.g. Binary Search, Mutex, Normal Forms)." }, { status: 400 });
    }

    const systemPrompt = getFlashcardsSystemPrompt({ language, subject, difficulty });
    const userPrompt = `Create exactly 8 revision flashcards for topic: "${trimmedTopic}" in subject "${subject}" (${difficulty} level).`;

    let parsedResult = null;
    let attempt = 0;

    while (attempt < 2 && !parsedResult) {
      attempt++;
      try {
        const rawText = await generateGeminiContent({
          userPrompt: attempt === 1 ? userPrompt : `${userPrompt}\nNote: Must be strict valid JSON matching {"cards": [{"front":"...","back":"..."}]}`,
          systemPrompt,
          jsonMode: true,
        });

        const cleaned = cleanJsonText(rawText);
        const parsed = JSON.parse(cleaned);

        if (validateCardsShape(parsed)) {
          parsedResult = {
            cards: parsed.cards.slice(0, CARD_COUNT).map((c) => ({
              front: c.front.trim(),
              back: c.back.trim(),
            })),
          };
          break;
        } else {
          console.warn(`[api/flashcards] Shape validation failed on attempt ${attempt}`);
        }
      } catch (genError) {
        if (genError.statusCode === 429 || genError.statusCode === 500) {
          throw genError;
        }
        console.warn(`[api/flashcards] Attempt ${attempt} failed with error:`, genError?.message);
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
    console.error("[api/flashcards] Error:", error);
    const status = error.statusCode || 500;
    const message = error.message || "Failed to generate flashcards. Please try again.";
    return Response.json({ error: message }, { status });
  }
}

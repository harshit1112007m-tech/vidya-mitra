import { GoogleGenAI } from "@google/genai";

/**
 * lib/gemini.js
 * Server-side Google Gemini client for Vidya Mitra.
 * Strictly uses official @google/genai SDK inside Next.js Route Handlers.
 * API key is kept secure on the server and never exposed to the client.
 */

export async function generateGeminiContent({ userPrompt, systemPrompt, jsonMode = false }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    const err = new Error("Server is missing GEMINI_API_KEY");
    err.statusCode = 500;
    err.code = "MISSING_KEY";
    throw err;
  }

  // Exact pattern specified in instructions
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.MODEL_NAME || "gemini-2.5-flash";

  const config = {
    systemInstruction: systemPrompt,
  };

  if (jsonMode) {
    config.responseMimeType = "application/json";
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config,
    });

    // .text is a property, NOT a function
    const text = response.text;
    if (typeof text !== "string") {
      const err = new Error("AI returned an invalid response, please try again");
      err.statusCode = 502;
      throw err;
    }

    return text;
  } catch (error) {
    const errorMsg = String(error?.message || "");
    const errorStatus = error?.status || error?.statusCode || error?.code;

    // Rate limit mapping (429)
    if (
      errorStatus === 429 ||
      errorMsg.includes("429") ||
      errorMsg.toLowerCase().includes("quota") ||
      errorMsg.toLowerCase().includes("resource exhausted") ||
      errorMsg.toLowerCase().includes("rate limit")
    ) {
      const rateLimitErr = new Error("Rate limit reached, please wait a minute and try again");
      rateLimitErr.statusCode = 429;
      throw rateLimitErr;
    }

    // Missing or invalid key mapping
    if (
      errorMsg.toLowerCase().includes("api key not valid") ||
      errorMsg.toLowerCase().includes("api_key")
    ) {
      const keyErr = new Error("Server is missing GEMINI_API_KEY");
      keyErr.statusCode = 500;
      throw keyErr;
    }

    throw error;
  }
}

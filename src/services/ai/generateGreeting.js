import { createServerFn } from "@tanstack/react-start";

/**
 * Server-side function that calls the Gemini API.
 * The API key (GEMINI_API_KEY) is read from server-side env only —
 * it is NEVER exposed to the browser.
 */
export const generateGreeting = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!data || typeof data.prompt !== "string" || !data.prompt.trim()) {
      throw new Error("A prompt is required.");
    }
    return { prompt: data.prompt.trim() };
  })
  .handler(async ({ data }) => {
    // process.env is only available on the server — never sent to the browser
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not set in your server environment. Add it to your .env file (without the VITE_ prefix so it stays server-only)."
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${data.prompt}\n\nMake sure the response is a professional, warm greeting from 'CA Raju Koyyala & Associates'. Do not use markdown headers, bold formatting, code blocks or templates in the output. Keep it as clean text ready to be sent to clients.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorDetails}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      throw new Error("No text was returned by the AI generator.");
    }

    return { text: text.trim() };
  });

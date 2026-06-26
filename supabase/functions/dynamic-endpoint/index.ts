import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

interface ReqPayload {
  prompt?: string;
  message?: string;
}

console.info("Gemini Edge Function initialized");

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    // Handle browser preflight CORS check
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const payload: ReqPayload = await req.json();
      const promptText = payload.prompt || payload.message || "Write a warm professional greeting message.";

      // Retrieve Groq API Key from Supabase secrets
      const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
      if (!GROQ_API_KEY) {
        return new Response(
          JSON.stringify({ error: "GROQ_API_KEY secret is not set in Supabase. Please set it using: supabase secrets set GROQ_API_KEY=your_key" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Dynamically check if prompt is for JSON / gallery metadata to bypass greeting wrapper
      let finalPrompt = promptText;
      if (!promptText.includes("JSON") && !promptText.includes("gallery")) {
        finalPrompt = `${promptText}\n\nMake sure the response is a professional, warm greeting from 'CA Raju Koyyala & Associates'. Do not use markdown headers, bold formatting, code blocks or templates in the output. Keep it as clean text ready to be sent to clients.`;
      }

      // Call Groq API (using stable llama3-8b-8192 model)
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: finalPrompt,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Groq API returned status ${response.status}: ${errorDetails}`);
      }

      const result = await response.json();
      const generatedText = result.choices?.[0]?.message?.content || "No content was generated.";

      return new Response(
        JSON.stringify({ text: generatedText.trim() }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Edge function error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
};

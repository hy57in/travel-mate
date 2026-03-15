const SYSTEM_PROMPT = `You are a travel itinerary planner. Generate a detailed day-by-day travel itinerary in JSON format.

Rules:
- Each day should have 5-8 items with realistic times
- Include a mix of activities: food, transit, activity, hotel, cherry (if spring Japan)
- Add lat/lng coordinates for each place
- Use the exact JSON structure shown below
- Respond ONLY with valid JSON, no other text

Output format:
{
  "days": [
    {
      "date": "",
      "title": "Day theme summary",
      "memo": "",
      "items": [
        { "time": "09:00", "text": "Place name", "type": "activity", "lat": 35.6812, "lng": 139.7671 }
      ]
    }
  ]
}

Valid types: flight, transit, car, hotel, food, activity, cherry`;

export default {
  async fetch(request, env) {
    // CORS
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = [env.ALLOWED_ORIGIN, "http://localhost:5173", "http://localhost:5174"];
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { destination, days, travelers, style } = await request.json();

      if (!destination || !days) {
        return new Response(JSON.stringify({ error: "destination and days required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userPrompt = `Plan a ${days}-day trip to ${destination} for ${travelers || 2} people.
Style: ${style || "balanced mix of food, sightseeing, and activities"}.
Include realistic times, local restaurant names, and accurate coordinates.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return new Response(JSON.stringify({ error: "Claude API error", detail: err }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await response.json();
      const text = result.content?.[0]?.text || "";

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const itinerary = JSON.parse(jsonMatch[0]);

      return new Response(JSON.stringify(itinerary), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

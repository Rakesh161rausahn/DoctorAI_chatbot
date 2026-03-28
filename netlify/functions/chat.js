const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const UPSTREAM_TIMEOUT_MS = 20000;

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  },
  body: JSON.stringify(body)
});

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, {
      error: "Server missing OPENROUTER_API_KEY/OPENAI_API_KEY"
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const model = payload.model || process.env.OPENROUTER_MODEL || "openrouter/auto";
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  if (!messages.length) {
    return jsonResponse(400, { error: "messages array is required" });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    let upstream;
    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.SITE_URL || "https://netlify.app",
          "X-Title": "AI Disease Predictor"
        },
        body: JSON.stringify({ model, messages }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }

    const text = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: text
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return jsonResponse(504, {
        error: "Upstream timeout",
        details: "Provider took too long to respond"
      });
    }

    return jsonResponse(502, {
      error: "Upstream request failed",
      details: error.message
    });
  }
};

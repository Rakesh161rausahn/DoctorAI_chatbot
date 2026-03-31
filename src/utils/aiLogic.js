// Real AI logic with a safe production path through Netlify Functions.
const CLIENT_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
const HAS_CLIENT_KEY = Boolean(CLIENT_API_KEY && !CLIENT_API_KEY.includes('your_openai_api_key'));
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const NETLIFY_FUNCTION_URL = '/.netlify/functions/openrouter';
const MODEL = 'gpt-oss-20b';

const parseOpenRouterResponse = async (response) => {
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error ${response.status}: ${err}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0]) {
    throw new Error("Invalid response format from OpenRouter: " + JSON.stringify(data));
  }

  return data;
};

const callOpenRouter = async (messages) => {
  if (HAS_CLIENT_KEY) {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLIENT_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Disease Predictor'
      },
      body: JSON.stringify({ model: MODEL, messages })
    });

    return parseOpenRouterResponse(response);
  }

  const response = await fetch(NETLIFY_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages })
  });

  return parseOpenRouterResponse(response);
};

export const generateBotResponse = async (userText, previousSymptoms) => {
  const prompt = `You are an AI medical symptom assessor. 
The user has reported the following previous symptoms: ${previousSymptoms.join(", ")}
Their latest message is: "${userText}"
If you have enough information (at least 3-4 symptoms or a clear picture), reply EXACTLY with "READY_FOR_PREDICTION", otherwise ask exactly ONE brief relevant follow-up question. Do not provide a diagnosis yet.`;

  try {
    const data = await callOpenRouter([{ role: "user", content: prompt }]);

    const reply = data.choices[0].message.content.trim();

    if (reply.includes("READY_FOR_PREDICTION")) {
      return { text: "Thank you. I have analyzed your symptoms and have enough information to provide an assessment. Click the 'Predict Disease' button below.", readyForPrediction: true };
    }

    return { text: reply, readyForPrediction: false };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      text: "⚠️ AI backend is not configured. Set OPENROUTER_API_KEY in Netlify environment variables (or VITE_OPENROUTER_API_KEY for local .env), then redeploy.",
      readyForPrediction: previousSymptoms.length >= 3
    };
  }
};

export const runPredictionEngine = async (allSymptomsString) => {
  const prompt = `You are an expert AI medical assistant. A user has reported the following symptoms: "${allSymptomsString}".
Respond with a JSON object ONLY, strictly matching this structure (no markdown tags, just pure JSON):
{
  "condition": "Predicted condition name",
  "confidence": "Low, Moderate, or High",
  "riskLevel": "Low, Moderate, or High",
  "advisory": "One short sentence of advice",
  "explanation": "2-3 sentences explaining the correlation between symptoms and condition",
  "recommendedSpecialist": {
    "type": "Name of Specialist (e.g. Cardiologist, General Physician, Neurologist)",
    "reason": "1 short sentence explaining why this specialist is appropriate"
  },
  "actions": ["Action 1", "Action 2", "Action 3"]
}`;

  try {
    const data = await callOpenRouter([{ role: "user", content: prompt }]);

    let jsonString = data.choices[0].message.content.trim();

    // Clean markdown blocks if the AI accidentally added them
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.replace(/\`\`\`/g, '').trim();
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Error:", error);
    return {
      condition: "AI Backend Not Configured",
      confidence: "Unknown",
      riskLevel: "Moderate",
      advisory: "Unable to reach AI service.",
      explanation: "Set OPENROUTER_API_KEY in Netlify (or VITE_OPENROUTER_API_KEY in local .env) and redeploy. Details: " + error.message,
      actions: ["Check Netlify environment variables", "Redeploy the site", "Verify OpenRouter account and model access"]
    };
  }
};

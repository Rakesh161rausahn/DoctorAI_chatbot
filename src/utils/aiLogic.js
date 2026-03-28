// Real AI Logic using OpenRouter API

const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL;
const LOCAL_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
const DEFAULT_NETLIFY_FUNCTION_URL = '/.netlify/functions/chat';
const DEFAULT_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/auto';
const REQUEST_TIMEOUT_MS = 20000;

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const getApiEndpoint = () => {
  if (API_PROXY_URL) return API_PROXY_URL;
  if (import.meta.env.PROD) return DEFAULT_NETLIFY_FUNCTION_URL;
  return OPENROUTER_URL;
};

const getHeaders = () => {
  const isNetlifyFunctionInProd = !API_PROXY_URL && import.meta.env.PROD;

  // Preferred mode: call your backend proxy (no secret in browser).
  if (API_PROXY_URL || isNetlifyFunctionInProd) {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Local-only convenience mode for development.
  if (LOCAL_API_KEY) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOCAL_API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Disease Predictor'
    };
  }

  return null;
};

const fetchWithTimeout = async (url, options, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
};

const postChatCompletion = async (prompt, headers) => {
  const response = await fetchWithTimeout(getApiEndpoint(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error ${response.status}: ${err}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0]) {
    throw new Error('Invalid response format from provider: ' + JSON.stringify(data));
  }

  return data.choices[0].message.content.trim();
};

const getMissingConfigMessage = () => {
  if (import.meta.env.PROD) {
    return 'Missing backend API config. On Netlify, set OPENROUTER_API_KEY in site environment variables for the built-in function.';
  }
  return 'No API configuration detected. Add VITE_API_PROXY_URL or a local VITE_OPENROUTER_API_KEY in .env.';
};

export const generateBotResponse = async (userText, previousSymptoms) => {
  const headers = getHeaders();

  if (!headers) {
    return {
      text: `Configuration error: ${getMissingConfigMessage()}`,
      readyForPrediction: previousSymptoms.length >= 3
    };
  }

  const prompt = `You are an AI medical symptom assessor. 
The user has reported the following previous symptoms: ${previousSymptoms.join(", ")}
Their latest message is: "${userText}"
If you have enough information (at least 3-4 symptoms or a clear picture), reply EXACTLY with "READY_FOR_PREDICTION", otherwise ask exactly ONE brief relevant follow-up question. Do not provide a diagnosis yet.`;

  try {
    const reply = await postChatCompletion(prompt, headers);

    if (reply.includes("READY_FOR_PREDICTION")) {
      return { text: "Thank you. I have analyzed your symptoms and have enough information to provide an assessment. Click the 'Predict Disease' button below.", readyForPrediction: true };
    }

    return { text: reply, readyForPrediction: false };
  } catch (error) {
    console.error("AI Error:", error);
    const isTimeout = error.name === 'AbortError';
    return { text: isTimeout ? 'Request timed out. Please try again.' : 'Network Error: ' + error.message, readyForPrediction: false };
  }
};

export const runPredictionEngine = async (allSymptomsString) => {
  const headers = getHeaders();

  if (!headers) {
    return {
      condition: "Real AI Not Configured",
      confidence: "None",
      riskLevel: "Moderate",
      advisory: "Please configure your API settings.",
      explanation: getMissingConfigMessage(),
      actions: ["Set VITE_API_PROXY_URL", "Deploy a backend proxy", "Restart the app"]
    };
  }

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
    let jsonString = await postChatCompletion(prompt, headers);

    // Clean markdown blocks if the AI accidentally added them
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.replace(/\`\`\`/g, '').trim();
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Error:", error);
    const isTimeout = error.name === 'AbortError';
    return {
      condition: "Error communicating with AI",
      confidence: "Unknown",
      riskLevel: "Moderate",
      advisory: isTimeout ? 'The request timed out.' : "Failed to communicate with OpenRouter.",
      explanation: isTimeout
        ? 'The AI provider took too long to respond. Please try again in a few seconds.'
        : "There was an error parsing the AI response or the API rejected the request: " + error.message,
      actions: ["Try again later", "Check your API key and model limits"]
    };
  }
};

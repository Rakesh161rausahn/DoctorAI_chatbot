// Real AI Logic using OpenRouter API

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

export const generateBotResponse = async (userText, previousSymptoms) => {
  // If no API key is provided, fallback to standard response
  if (!API_KEY || API_KEY.includes('your_openai_api_key')) {
    return {
      text: "⚠️ No API key detected. Please add your API key to the .env file.",
      readyForPrediction: previousSymptoms.length >= 3
    };
  }

  const prompt = `You are an AI medical symptom assessor. 
The user has reported the following previous symptoms: ${previousSymptoms.join(", ")}
Their latest message is: "${userText}"
If you have enough information (at least 3-4 symptoms or a clear picture), reply EXACTLY with "READY_FOR_PREDICTION", otherwise ask exactly ONE brief relevant follow-up question. Do not provide a diagnosis yet.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin, // OpenRouter expects this
        'X-Title': 'AI Disease Predictor' // OpenRouter expects this
      },
      body: JSON.stringify({
        model: "gpt-oss-20b", // User's custom OpenRouter model
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response format from OpenRouter: " + JSON.stringify(data));
    }

    const reply = data.choices[0].message.content.trim();

    if (reply.includes("READY_FOR_PREDICTION")) {
      return { text: "Thank you. I have analyzed your symptoms and have enough information to provide an assessment. Click the 'Predict Disease' button below.", readyForPrediction: true };
    }

    return { text: reply, readyForPrediction: false };
  } catch (error) {
    console.error("AI Error:", error);
    return { text: "Network Error: " + error.message, readyForPrediction: false };
  }
};

export const runPredictionEngine = async (allSymptomsString) => {
  if (!API_KEY || API_KEY.includes('your_openai_api_key')) {
    return {
      condition: "Real AI Not Configured",
      confidence: "None",
      riskLevel: "Moderate",
      advisory: "Please configure your API key.",
      explanation: "The application is currently running without a real AI backend. You must provide an API key in the .env file.",
      actions: ["Open .env file", "Paste your API key", "Restart the server"]
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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Disease Predictor'
      },
      body: JSON.stringify({
        model: "gpt-oss-20b",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response format from OpenRouter: " + JSON.stringify(data));
    }

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
      condition: "Error communicating with AI",
      confidence: "Unknown",
      riskLevel: "Moderate",
      advisory: "Failed to communicate with OpenRouter.",
      explanation: "There was an error parsing the AI response or the API rejected the request: " + error.message,
      actions: ["Try again later", "Check your API key and model limits"]
    };
  }
};

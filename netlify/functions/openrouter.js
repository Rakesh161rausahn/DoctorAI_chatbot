const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: jsonHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes('your_openai_api_key')) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: 'Missing OPENROUTER_API_KEY in Netlify environment variables.'
      })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const model = body.model || 'gpt-oss-20b';
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!messages.length) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Request body must include a non-empty messages array.' })
      };
    }

    const referer = event.headers.origin || event.headers.referer || process.env.URL || 'https://netlify.app';

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': 'AI Disease Predictor'
      },
      body: JSON.stringify({ model, messages })
    });

    const text = await response.text();
    return {
      statusCode: response.status,
      headers: jsonHeaders,
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: `Function error: ${error.message}` })
    };
  }
};

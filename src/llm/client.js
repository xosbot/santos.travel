// ============================================================================
// LLM Client — OpenAI-compatible provider wrapper
// ============================================================================
// Supports any OpenAI-compatible API (OpenAI, Azure, Groq, Together, etc.)
// Structured output via response_format or JSON mode.
// Retry + exponential backoff built in.
// ============================================================================

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

async function call({
  messages,
  model = 'gpt-4o',
  responseFormat = null,
  temperature = 0.1,
  maxTokens = 4096,
}) {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    throw new Error('LLM_API_KEY environment variable is not set');
  }

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }

    try {
      const url = baseUrl.replace(/\/$/, '') + '/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.text();
        // Retry on 429 (rate limit) or 5xx
        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(`LLM API error ${response.status}: ${errBody}`);
          continue;
        }
        throw new Error(`LLM API error ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice) {
        throw new Error('LLM returned no choices');
      }

      return {
        content: choice.message?.content || '',
        finishReason: choice.finish_reason,
        usage: data.usage || null,
        model: data.model,
      };
    } catch (err) {
      // Don't retry non-retryable errors (4xx except 429)
      if (err.message?.includes('LLM API error 4') && !err.message?.includes('429')) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('LLM call failed after max retries');
}

async function callStructured({ messages, model, schema, schemaName, temperature, maxTokens }) {
  const result = await call({
    messages,
    model,
    temperature,
    maxTokens,
    responseFormat: {
      type: 'json_schema',
      json_schema: {
        name: schemaName || 'structured_output',
        strict: true,
        schema,
      },
    },
  });

  try {
    return { parsed: JSON.parse(result.content), ...result };
  } catch {
    throw new Error(`LLM returned invalid JSON: ${result.content}`);
  }
}

module.exports = { call, callStructured };

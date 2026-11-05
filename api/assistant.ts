import { handleAssistantRequest } from '../src/server/assistantHandler.js';
import { generateOpenAIAssistantResponse } from '../src/server/openAIProvider.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
  }

  // Prefer OpenAI when configured. Gemini/local handling remains the safe fallback.
  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      const result = await generateOpenAIAssistantResponse(message.trim(), context || {});
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(result);
    } catch (error: any) {
      // Do not log provider response bodies, credentials, or user content.
      console.warn('[Assistant] OpenAI provider unavailable; using configured fallback.', {
        reason: error?.name === 'AbortError' ? 'timeout' : String(error?.message || 'unknown').slice(0, 100),
      });
    }
  }

  return handleAssistantRequest(req, res);
}

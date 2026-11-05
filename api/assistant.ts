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

  // Route explicit discovery/current-information requests through Gemini Google Search grounding.
  // General conversational requests may use the configured OpenAI provider.
  const needsGroundedSearch = /ابحث|أبحث|ابحث لي|أبحث لي|نحب نلقى|نحب نعرف|دورلي|قلبلي|شوفلي|بحث|دور|وين|أين|أفضل|مطاعم|مطعم|سعر|أسعار|ثمن|تقييم|متاح|مفتوح|آخر|اليوم|الآن|قريب|شراء|كراء|عقار|شقة|طاكسي|فندق|حجز|search|find|near|best|price|latest|today|open|available|restaurant|hotel|taxi|real estate|rent|buy/i.test(message.trim());
  if (!needsGroundedSearch && process.env.OPENAI_API_KEY?.trim()) {
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

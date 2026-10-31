import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { processLocalNLP, LocalNLPResult } from '../utils/localAssistantNLP.js';

/**
 * Standard Unified Assistant Response
 */
export interface UnifiedAssistantResponse {
  intent: 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'booking' | 'more_services' | 'chat';
  reply: string;
  speechText: string;
  actionType: 'navigate_to_tab' | 'show_results' | 'none';
  targetTab: 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'chat' | 'more_services' | 'home';
  parameters: {
    wilaya?: string;
    searchQuery?: string;
    subject?: string;
    [key: string]: any;
  };
  citations?: Array<{
    title: string;
    authorOrPublisher: string;
    year: string;
  }>;
  isAiLive: boolean;
  provider: 'Gemini' | 'Local Fallback';
  diagnostics?: {
    attempts: number;
    model?: string;
    fallbackReason?: string;
  };
}

const SYSTEM_PROMPT = `
You are the central voice & intelligence behind "ZaLoVoice" (مساعد ZaLoVoice الصوتي والذكي العالمي).
ZaLoVoice is a universal, multilingual AI assistant accessible to all, with special care for blind individuals, visually impaired, and people of determination.
You possess native fluency in:
- Modern Standard Arabic (العربية الفصحى)
- Algerian Arabic Darija (الدارجة الجزائرية)
- English
- French

You assist users across 7 core integrated services:
1. "academic": School, university & scientific research, lesson explanation (e.g. physics laws like Newton's 2nd law, mathematics, biology, philosophy, computer science). Provide structured explanations, key formulas, verified facts, and authentic academic citations with author/publisher/year.
2. "commerce": Searching and purchasing products in Algerian Dinars (DZD / دج) across 58 wilayas, comparing prices, and contacting sellers.
3. "real_estate": Finding housing for rent (كراء), sale (شراء/بيع), or vacation (عطلات) across Algerian wilayas.
4. "taxi": Booking a taxi or VTC ride between locations/wilayas with distance and DZD pricing.
5. "food": Finding traditional Algerian meals (شخشوخة، كسكسي، قرنطيطة، رشتة) or fast food and pizza.
6. "booking": Booking appointments with doctors, clinics, hotel stays, or local artisans.
7. "chat": General friendly, accessible assistance and orientation, or navigating to messages/chat ("افتح الرسائل" / "المحادثات").

CRITICAL INSTRUCTIONS:
- Analyze the user query.
- Detect the user's intent: one of ["academic", "commerce", "real_estate", "taxi", "food", "booking", "more_services", "chat"].
- Extract any target wilaya, academic subject, or search keywords.
- Formulate a clear, culturally authentic, and polite response in the matching language.
- Provide a concise, phonetically natural "speechText" specifically optimized for text-to-speech audio narration for blind users.
- If the intent is "academic", provide citations and key points.
- If the user asks to open or navigate to a service (e.g. "افتح الرسائل", "اريد شراء عقار", "طلب طاكسي"), set "actionType": "navigate_to_tab" and specify "targetTab".
- Respond ONLY with a valid JSON object matching this schema:
{
  "intent": "academic" | "commerce" | "real_estate" | "taxi" | "food" | "booking" | "more_services" | "chat",
  "reply": "نص الرد الواضح والمنظم للمستخدم",
  "speechText": "جملة موجزة واضحة مناسبة تماماً للنطق الصوتي وقارئات الشاشة",
  "actionType": "navigate_to_tab" | "show_results" | "none",
  "targetTab": "academic" | "commerce" | "real_estate" | "taxi" | "food" | "bookings" | "chat" | "more_services" | "home",
  "parameters": {
    "wilaya": "اسم الولاية إن وجدت",
    "searchQuery": "كلمات البحث المستخرجة",
    "subject": "المادة الأكاديمية إن وجدت"
  },
  "citations": [
    {
      "title": "عنوان المرجع أو الكتاب",
      "authorOrPublisher": "المؤلف أو الناشر",
      "year": "2024"
    }
  ]
}
`;

/**
 * Determine if an error is transient and eligible for retry (429, 503, timeouts)
 * Permanent errors (400, 401, 403, 404) are NOT retried.
 */
export function isTransientError(err: any): boolean {
  if (!err) return false;

  const msg = String(err.message || '').toLowerCase();

  // If request timed out, fail fast to Local Fallback to stay strictly within Vercel budget
  if (msg.includes('timed out') || msg.includes('timeout') || err.name === 'AbortError') {
    return false;
  }

  const status = Number(err.status || err.code || err.statusCode);
  if (status === 429 || status === 503 || status === 502 || status === 504 || status === 500) {
    return true;
  }

  if (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('econnreset')
  ) {
    return true;
  }

  // Permanent errors (auth failures, invalid requests)
  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return false;
  }

  if (
    msg.includes('api_key_invalid') ||
    msg.includes('invalid api key') ||
    msg.includes('permission_denied') ||
    msg.includes('forbidden') ||
    msg.includes('not found')
  ) {
    return false;
  }

  return false;
}

/**
 * Sleep helper with promise
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Cleanly parses JSON string from Gemini, handling markdown code fences if returned
 */
export function parseGeminiJsonResponse(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

/**
 * Execute a single Gemini call with an internal timeout (tailored for Vercel limits)
 */
async function executeGeminiCall(
  ai: GoogleGenAI,
  message: string,
  context: any,
  timeoutMs: number = 8500
): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `User query: "${message}". Context: ${JSON.stringify(context || {})}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.7,
        abortSignal: controller.signal,
      },
    });
    clearTimeout(timer);
    const rawText = response.text || '';
    return parseGeminiJsonResponse(rawText);
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError' || controller.signal.aborted) {
      throw new Error(`Gemini API request timed out (${timeoutMs}ms)`);
    }
    throw err;
  }
}

/**
 * Build unified local fallback response
 */
export function createLocalFallbackResponse(
  message: string,
  wilaya: string,
  reason: string,
  attempts: number = 0
): UnifiedAssistantResponse {
  const local = processLocalNLP(message, wilaya);
  return {
    intent: local.intent,
    reply: local.reply,
    speechText: local.speechText,
    actionType: local.actionType,
    targetTab: local.targetTab,
    parameters: local.parameters || { wilaya },
    citations: local.citations || [],
    isAiLive: false,
    provider: 'Local Fallback',
    diagnostics: {
      attempts,
      fallbackReason: reason,
    },
  };
}

/**
 * Centralized Assistant Request Handler
 * Supports:
 * - Secure GEMINI_API_KEY retrieval from process.env (never logged, never exposed)
 * - Exponential backoff with jitter for transient 429/503 errors (max 2 retries)
 * - Immediate abort for permanent 400/401/403 errors
 * - Strict timeouts within Vercel execution ceilings
 * - Unified response contract: isAiLive=true + provider="Gemini" vs isAiLive=false + provider="Local Fallback"
 */
export async function handleAssistantRequest(req: any, res: any) {
  const startTime = Date.now();
  let attempts = 0;

  try {
    const { message, context } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
        isAiLive: false,
        provider: 'Local Fallback',
      });
    }

    const trimmedMessage = message.trim();
    const currentWilaya = context?.currentWilaya || 'الجزائر العاصمة';

    // 1. Safe API Key validation (Strictly server-side, never logged)
    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = typeof apiKey === 'string' && apiKey.trim().length > 0;

    if (!hasValidKey) {
      const fallback = createLocalFallbackResponse(
        trimmedMessage,
        currentWilaya,
        'GEMINI_API_KEY is not configured in environment',
        0
      );
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(fallback);
    }

    // 2. Initialize GoogleGenAI SDK with required user-agent
    const ai = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // 3. Retry loop with Exponential Backoff + Jitter for transient errors
    const MAX_RETRIES = 2; // Up to 3 attempts total (initial + 2 retries)
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      attempts = attempt + 1;

      try {
        // Individual call timeout: 7000ms on first, 5000ms on retries
        const callTimeout = attempt === 0 ? 7000 : 5000;
        const geminiResult = await executeGeminiCall(ai, trimmedMessage, context, callTimeout);

        // Validate structure from Gemini
        if (geminiResult && typeof geminiResult === 'object' && geminiResult.reply) {
          const unifiedResponse: UnifiedAssistantResponse = {
            intent: geminiResult.intent || 'chat',
            reply: geminiResult.reply,
            speechText: geminiResult.speechText || geminiResult.reply,
            actionType: geminiResult.actionType || 'none',
            targetTab: geminiResult.targetTab || 'home',
            parameters: geminiResult.parameters || { wilaya: currentWilaya },
            citations: Array.isArray(geminiResult.citations) ? geminiResult.citations : [],
            isAiLive: true,
            provider: 'Gemini',
            diagnostics: {
              attempts,
              model: 'gemini-3.8-flash',
            },
          };

          res.setHeader('Content-Type', 'application/json');
          return res.status(200).json(unifiedResponse);
        }

        // If returned JSON was empty or malformed, break to fallback
        throw new Error('Gemini response missing valid reply property');
      } catch (err: any) {
        lastError = err;

        // Check if error is transient
        const transient = isTransientError(err);

        // If permanent error (e.g. 400, 401, 403), stop immediately without retry
        if (!transient) {
          console.warn(`[Assistant] Permanent Gemini error (attempt ${attempts}): ${err?.message || 'Unknown'}`);
          break;
        }

        // If we haven't exhausted retries, apply exponential backoff with jitter
        if (attempt < MAX_RETRIES) {
          // Exponential backoff: attempt 0 -> 400ms, attempt 1 -> 800ms (+ jitter)
          const baseDelay = 400 * Math.pow(2, attempt);
          const jitter = Math.floor(Math.random() * 150);
          const backoffDelay = Math.min(baseDelay + jitter, 1200);

          console.warn(
            `[Assistant] Transient Gemini error (${err?.status || err?.message}), retrying in ${backoffDelay}ms (attempt ${attempts}/${MAX_RETRIES + 1})...`
          );

          await sleep(backoffDelay);
        }
      }
    }

    // 4. If all attempts failed or non-transient error occurred -> Unified Local Fallback
    const reasonMsg = lastError?.message || 'Connection unavailable';
    const fallbackResponse = createLocalFallbackResponse(
      trimmedMessage,
      currentWilaya,
      `Gemini unavailable (${reasonMsg})`,
      attempts
    );

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(fallbackResponse);
  } catch (criticalError: any) {
    // 5. Emergency Catch-All to prevent any 500 crash for the client
    const fallback = createLocalFallbackResponse(
      req.body?.message || '',
      req.body?.context?.currentWilaya || 'الجزائر العاصمة',
      `Internal error (${criticalError?.message || 'Unknown'})`,
      attempts
    );
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(fallback);
  }
}

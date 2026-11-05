type AssistantPayload = {
  intent: 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'booking' | 'more_services' | 'chat';
  reply: string;
  speechText: string;
  actionType: 'navigate_to_tab' | 'show_results' | 'none';
  targetTab: 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'chat' | 'more_services' | 'home';
  parameters: Record<string, unknown>;
  citations: Array<{ title: string; authorOrPublisher: string; year: string }>;
  isAiLive: true;
  provider: 'OpenAI';
};

const SYSTEM_PROMPT = `
أنت المساعد المركزي لتطبيق ZaLoVoice الجزائري متعدد اللغات.
افهم العربية الفصحى والدارجة الجزائرية والإنجليزية والفرنسية.
حلل الطلب وحدد النية ضمن: academic, commerce, real_estate, taxi, food, booking, more_services, chat.
حدد targetTab من: academic, commerce, real_estate, taxi, food, bookings, chat, more_services, home.
اكتب reply واضحاً ومفيداً بلغة المستخدم، وspeechText موجزاً مناسباً للنطق وقارئات الشاشة.
لا تدّع تنفيذ حجز أو شراء أو اتصال خارجي لم يحدث فعلاً.
إذا طلب المستخدم فتح خدمة، استخدم actionType=navigate_to_tab والوجهة المناسبة.
أعد JSON صالحاً فقط بالحقول: intent, reply, speechText, actionType, targetTab, parameters, citations.
`;

const allowedIntents = new Set(['academic','commerce','real_estate','taxi','food','booking','more_services','chat']);
const allowedTabs = new Set(['academic','commerce','real_estate','taxi','food','bookings','chat','more_services','home']);

export async function generateOpenAIAssistantResponse(message: string, context: Record<string, unknown> = {}): Promise<AssistantPayload> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify({ message, context }) },
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 900,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Never include response bodies or credentials in logs/errors.
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const payload = await response.json() as any;
    const raw = payload?.choices?.[0]?.message?.content;
    if (typeof raw !== 'string' || !raw.trim()) throw new Error('OpenAI returned an empty response');

    const parsed = JSON.parse(raw);
    const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';
    if (!reply) throw new Error('OpenAI response did not contain a reply');

    const intent = allowedIntents.has(parsed.intent) ? parsed.intent : 'chat';
    const targetTab = allowedTabs.has(parsed.targetTab) ? parsed.targetTab : 'home';
    const actionType = ['navigate_to_tab','show_results','none'].includes(parsed.actionType)
      ? parsed.actionType
      : 'none';

    return {
      intent,
      reply,
      speechText: typeof parsed.speechText === 'string' && parsed.speechText.trim() ? parsed.speechText.trim() : reply,
      actionType,
      targetTab,
      parameters: parsed.parameters && typeof parsed.parameters === 'object' ? parsed.parameters : context,
      citations: Array.isArray(parsed.citations) ? parsed.citations.slice(0, 8) : [],
      isAiLive: true,
      provider: 'OpenAI',
    };
  } finally {
    clearTimeout(timeout);
  }
}

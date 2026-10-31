/**
 * Safe Health Diagnostics Handler for ZaLoVoice
 * Shared between Express (server.ts) and Vercel Serverless Function (api/health.ts)
 * Does NOT expose any API keys, tokens, or secret values.
 */
export async function handleHealthCheck(req: any, res: any) {
  const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const isSupabaseConfigured = Boolean(
    process.env.VITE_SUPABASE_URL &&
    process.env.VITE_SUPABASE_ANON_KEY &&
    process.env.VITE_SUPABASE_URL.trim().length > 0
  );
  const isMapsConfigured = Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY && process.env.VITE_GOOGLE_MAPS_API_KEY.trim().length > 0);

  const responsePayload = {
    status: 'online',
    appName: 'ZaLoVoice',
    targetMarket: 'Global & Algeria (Accessible)',
    platform: process.env.VERCEL ? 'vercel-serverless' : 'express-node',
    integrations: {
      geminiAi: {
        configured: isGeminiConfigured,
        model: 'gemini-3.8-flash',
        status: isGeminiConfigured ? 'ready' : 'pending_key',
        message: isGeminiConfigured
          ? 'تم تهيئة مفتاح Gemini بنجاح'
          : 'في انتظار تعيين GEMINI_API_KEY في إعدادات البيئة (Secrets)',
      },
      supabase: {
        configured: isSupabaseConfigured,
        status: isSupabaseConfigured ? 'ready' : 'pending_configuration',
        message: isSupabaseConfigured
          ? 'تم ربط خدمة Supabase'
          : 'في انتظار إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY',
      },
      maps: {
        configured: isMapsConfigured,
        provider: isMapsConfigured ? 'Google Maps' : 'Browser Geolocation + Algeria Wilayas Adapter',
      },
    },
    timestamp: new Date().toISOString(),
  };

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(responsePayload);
}

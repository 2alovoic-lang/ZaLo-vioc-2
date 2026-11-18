/**
 * Safe Health Diagnostics Handler for ZaLoVoice.
 * Reports only whether integrations are configured; never exposes secret values.
 */
export async function handleHealthCheck(req: any, res: any) {
  const isOpenAIConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
  const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
  const isSupabaseConfigured = Boolean(
    process.env.VITE_SUPABASE_URL?.trim() &&
    process.env.VITE_SUPABASE_ANON_KEY?.trim() &&
    process.env.VITE_SUPABASE_URL.includes('supabase.co')
  );
  const isMapsConfigured = Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY?.trim());

  const responsePayload = {
    status: 'online',
    appName: 'ZaLoVoice',
    targetMarket: 'Global & Algeria (Accessible)',
    platform: process.env.VERCEL ? 'vercel-serverless' : 'express-node',
    integrations: {
      openai: {
        configured: isOpenAIConfigured,
        model: process.env.OPENAI_MODEL || 'gpt-5.5',
        status: isOpenAIConfigured ? 'configured_not_live_tested' : 'pending_key',
      },
      geminiAi: {
        configured: isGeminiConfigured,
        model: 'gemini-3.8-flash',
        status: isGeminiConfigured ? 'configured_not_live_tested' : 'pending_key',
      },
      supabase: {
        configured: isSupabaseConfigured,
        status: isSupabaseConfigured ? 'configured' : 'pending_configuration',
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

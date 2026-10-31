/**
 * Server-side Google Cloud Text-to-Speech proxy.
 * Required Vercel environment variable: GOOGLE_TTS_API_KEY
 * Optional: GOOGLE_TTS_VOICE (defaults to a female Modern Standard Arabic voice).
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Cloud voice is not configured' });
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text || text.length > 5000) {
    return res.status(400).json({ error: 'Text must contain between 1 and 5000 characters' });
  }

  const voiceName = process.env.GOOGLE_TTS_VOICE || 'ar-XA-Chirp3-HD-Achernar';
  try {
    const upstream = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'ar-XA', name: voiceName },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      },
    );

    if (!upstream.ok) {
      // Do not expose upstream response bodies or credentials to the client.
      return res.status(502).json({ error: 'Cloud voice provider request failed' });
    }

    const payload = await upstream.json() as { audioContent?: string };
    if (!payload.audioContent) {
      return res.status(502).json({ error: 'Cloud voice provider returned no audio' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      audioContent: payload.audioContent,
      mimeType: 'audio/mpeg',
      voice: voiceName,
    });
  } catch {
    return res.status(502).json({ error: 'Cloud voice service is temporarily unavailable' });
  }
}

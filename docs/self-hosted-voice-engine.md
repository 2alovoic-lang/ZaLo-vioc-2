# ZaLoVoice self-hosted voice engine

## Goal

Provide two selectable, production-oriented assistant voices (one masculine, one feminine) without per-character TTS vendor billing. Keep the client independent of the model vendor so additional voices and models can be added later.

## Initial architecture

- The web client sends text, language, and a stable voice ID (`male_ar` or `female_ar`) to a ZaLoVoice backend endpoint.
- The backend validates the request, applies limits, and forwards it to a separately hosted GPU inference service.
- The inference service returns audio (prefer streaming once the prototype is stable).
- Voice IDs map to server-side model configuration and approved reference recordings. Never accept arbitrary reference-audio URLs or arbitrary model paths from clients.
- Store the user's selected voice ID in their profile/preferences when authentication is available; use a local preference only as a temporary fallback.
- Keep the existing browser SpeechSynthesis path as an offline/error fallback, not as the guaranteed production voice.

## Model candidates to benchmark

### 1. Habibi-TTS specialized ALG and MSA

- Upstream: https://github.com/SWivid/Habibi-TTS
- Model card: https://huggingface.co/SWivid/Habibi-TTS
- The upstream model card states that specialized ALG, MSA, EGY, IRQ, and MAR models are Apache-2.0; the Unified, SAU, and UAE models are CC-BY-NC-SA-4.0 and are not suitable for commercial use under that non-commercial license.
- ALG is the first candidate for Algerian Darija. MSA is the candidate for Modern Standard Arabic.
- Confirm exact checkpoint, runtime requirements, speaker conditioning, and output quality before selecting it for production.

### 2. SILMA TTS v1

- Upstream: https://github.com/SILMA-AI/silma-tts
- Model card: https://huggingface.co/silma-ai/silma-tts
- The project states code MIT and model weights Apache-2.0, with Arabic and English support.
- It uses a reference audio sample for voice conditioning/cloning. Use only recordings with documented consent and rights.
- Benchmark as an MSA/English comparison candidate; do not assume it provides two ready-made gender presets.

## Language and speaking-style policy

- In everyday conversation, prefer natural Algerian Darija when the user speaks Darija.
- When explaining lessons, science, instructions, formal information, or when the user requests it, switch to clear Modern Standard Arabic (MSA).
- Preserve the user's chosen male/female voice across both registers; changing language/register must not silently change the selected voice.
- Treat English as a later language expansion and benchmark it separately.
- Do not claim dialect-level fluency until native Algerian listeners have evaluated representative samples from multiple regions.

## Voice asset policy

- Create two distinct, licensed/consented reference recordings for the male and female presets.
- Recordings must be clean, representative Arabic speech and have matching transcripts.
- Keep reference audio private on the inference host; do not expose it to the browser.
- Record consent, permitted commercial use, attribution requirements, and any dataset/model restrictions before launch.
- Do not clone a public figure or any person's voice without explicit documented permission.

## Production safeguards

- Never put model credentials or inference-host secrets in browser code or Git.
- Add authentication or signed service-to-service requests, request-size limits, rate limits, concurrency limits, and per-user abuse controls.
- Add timeouts, cancellation propagation, bounded text length, output-size limits, and safe error responses.
- Cache only when privacy and user-data policy permit; do not log user speech/text unnecessarily.
- Measure time-to-first-audio, real-time factor, GPU memory, concurrent sessions, error rate, and cost per hour before choosing a host.
- Keep a provider interface so the app can switch between self-hosted TTS and an approved fallback without UI rewrites.

## Phased implementation

1. Benchmark Habibi ALG/MSA and SILMA v1 with the same Arabic test set and two consented voice references.
2. Choose the best model for each language based on intelligibility, naturalness, latency, GPU footprint, and commercial license.
3. Build a small GPU inference prototype and a protected backend adapter; do not change production traffic.
4. Add male/female selection and persist the preference.
5. Test Android playback, interruption/cancellation, network loss, concurrency, and cost.
6. Only after explicit approval, merge and deploy to production.

## Current status

This document is the architecture foundation only. No model is deployed, no GPU host is provisioned, no voice recordings have been uploaded, and no production code or deployment has been changed.

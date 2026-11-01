# ZaLoVoice Arabic TTS benchmark preparation

## Goal

Prepare a reproducible, low-risk evaluation of locally hosted text-to-speech candidates for two equally important language varieties:

- Algerian Arabic (Darija): everyday conversation and service requests.
- Modern Standard Arabic (MSA): education, explanations, and clear informational responses.

The target sound is highly natural and human-like. The first release target is two selectable assistant voice profiles (one masculine-presenting and one feminine-presenting), while keeping the architecture open to additional voices later.

This document prepares the test. It does **not** claim that either candidate has been run, that both voice profiles are supported, or that any model is approved for commercial use.

## Candidate shortlist

1. Habibi-TTS: evaluate the exact ALG and MSA model artifacts separately. Confirm the license attached to each exact checkpoint/weight file and its dependencies before any commercial use.
   - Project: https://github.com/SWivid/Habibi-TTS
   - Model collection: https://huggingface.co/SWivid/Habibi-TTS
2. SILMA TTS: evaluate as an MSA comparison candidate and verify the exact model artifact, inference requirements, and commercial-use terms.
   - Project: https://github.com/SILMA-AI/silma-tts
   - Model: https://huggingface.co/silma-ai/silma-tts

A repository's code license does not automatically establish the license of model weights, datasets, speaker recordings, or dependencies. Record the exact model revision and license evidence before downloading or serving weights.

## Evaluation design

### Balanced language coverage

Use the same number of samples for Darija and MSA. Include short, medium, and longer utterances in each variety. Avoid evaluating a candidate on a language variety it does not explicitly claim to support.

### Voice coverage

Evaluate masculine and feminine voice output separately. A voice counts as supported only if the model documentation and a real inference test establish a supported method (built-in speaker, licensed speaker asset, or consented reference recording). Do not infer gender support from a speaker label alone.

Do not clone or imitate an identifiable person's voice without explicit, documented permission and rights suitable for commercial use. For the initial benchmark, prefer model-provided licensed voices where available. If reference audio is required, do not collect or upload it until the user separately approves the recording plan and hosting location.

### Test phrases

The paired test corpus is stored at `tests/fixtures/arabic-tts-benchmark.json`. It contains semantically matched Darija/MSA utterances covering greetings, service requests, transport, commerce, education, and safety-relevant information.

Do not silently rewrite the corpus per model. If a model requires normalization, preserve both the original text and the normalized input in the experiment record.

## Metrics and scoring

Score each dimension from 1 (poor) to 5 (excellent). Keep Darija and MSA scores separate.

| Dimension | What to assess |
|---|---|
| Naturalness | Does it sound like fluent human speech rather than a robotic reading? |
| Pronunciation | Are words, consonants, vowels, and endings pronounced correctly? |
| Local authenticity | Does Darija sound recognizably Algerian rather than generic or another dialect? |
| Intelligibility | Can listeners understand the sentence on first hearing? |
| Prosody | Are pauses, emphasis, rhythm, and sentence melody appropriate? |
| Voice consistency | Does the selected voice remain stable across both language varieties? |

Record objective system metrics as well:

- Time to first audio (seconds).
- Real-time factor (generation duration divided by audio duration).
- Peak GPU memory (VRAM).
- Peak system memory (RAM).
- Cold-start time and warm-request latency.
- Concurrent request behavior and failure rate.

Suggested initial acceptance gates (to be validated with listening tests):
- No critical mistranscription or meaning-changing pronunciation error in the safety/service samples.
- Mean naturalness and intelligibility at least 4/5 for each language variety.
- Both requested voice profiles demonstrably available, or clearly mark the missing profile as a blocker.
- Warm real-time factor below 1.0 for the intended serving hardware.
- No unbounded queue growth or cross-user audio leakage under the concurrency test.

## Reproducibility record

For every run, record:

- Date, operator, model repository, exact revision/commit, checkpoint filename and checksum.
- Model and dataset licenses with links or archived evidence.
- Runtime, package versions, inference settings, tokenizer/normalization settings.
- GPU model, VRAM, driver/CUDA versions, RAM.
- Voice profile and how it was obtained.
- Input text, generated audio duration, generation time, and any errors.
- Listener scores and notes, using anonymized evaluator IDs.

Do not store private reference recordings or generated user conversations in a public repository.

## Safe execution sequence

1. Verify model cards, exact checkpoint licenses, and inference documentation.
2. Inspect required hardware and dependencies without renting a GPU.
3. Run a small local or explicitly approved temporary-GPU smoke test.
4. Generate the balanced corpus for each supported voice/language combination.
5. Have fluent Algerian Arabic and MSA listeners score the outputs.
6. Compare quality, latency, memory, and estimated monthly serving cost.
7. Only then propose a production inference service.

No paid GPU instance, model hosting subscription, reference recording collection, secret creation, deployment, merge, or production change is authorized by this benchmark preparation.

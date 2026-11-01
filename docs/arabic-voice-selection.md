# Arabic voice behavior in ZaLoVoice

## Language order
- Modern Standard Arabic (MSA) is the primary/default Arabic speech profile.
- Algerian Darija is a secondary profile and is selected only when the app passes the Darija language code.

## Device voice selection
The browser SpeechSynthesis API exposes installed voice names and language tags, but does not expose a reliable male/female gender field. ZaLoVoice therefore must not infer a voice's gender from its index or pitch.

The speech manager now keeps separate cached selections for MSA and Darija. MSA prefers an available general Arabic voice (with regional fallbacks); Darija prefers an actual ar-DZ voice only when the device provides one, otherwise it falls back to a general Arabic voice. This fallback does not mean native Algerian Darija support.

## User-tested Android voice preferences
The user reported that on their Android device:
- the first Arabic voice sounded best among the feminine options;
- the second Arabic voice was the preferred masculine option.

These are device-local ordinal choices, not portable voice identifiers. They must be mapped to actual browser voice names on each device before they can be safely selected in the app.

## Constraints
- Free device/browser speech synthesis remains the trial-stage default.
- No paid TTS API, GPU host, audio upload, model download, or secret is introduced here.
- Actual male/female voice selection in the app requires a UI preference bound to exact available voice identifiers and must be verified on target Android browsers.

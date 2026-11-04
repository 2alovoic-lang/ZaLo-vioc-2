#!/usr/bin/env bash
set -euo pipefail
JAVA_DIR="android/app/src/main/java/com/zalovoice/app"
mkdir -p "$JAVA_DIR"
cp native-android/SpeechBridgePlugin.java "$JAVA_DIR/SpeechBridgePlugin.java"
cp native-android/MainActivity.java "$JAVA_DIR/MainActivity.java"
python3 - <<'PY'
from pathlib import Path
p = Path("android/app/src/main/AndroidManifest.xml")
s = p.read_text()
permission = '    <uses-permission android:name="android.permission.RECORD_AUDIO" />'
if "android.permission.RECORD_AUDIO" not in s:
    s = s.replace("<manifest", "<manifest", 1)
    end = s.find(">", s.find("<manifest")) + 1
    s = s[:end] + "\\n" + permission + s[end:]
p.write_text(s)
PY

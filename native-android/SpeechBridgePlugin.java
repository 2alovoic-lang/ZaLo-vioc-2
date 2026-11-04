package com.zalovoice.app;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.PermissionState;

@CapacitorPlugin(name = "SpeechBridge", permissions = {
  @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
})
public class SpeechBridgePlugin extends Plugin {
  private SpeechRecognizer recognizer;
  private TextToSpeech tts;
  private boolean ttsReady = false;

  @Override public void load() {
    tts = new TextToSpeech(getContext(), status -> {
      ttsReady = status == TextToSpeech.SUCCESS;
      if (ttsReady) tts.setLanguage(Locale.forLanguageTag("ar"));
    });
  }

  @PluginMethod public void startListening(PluginCall call) {
    if (Build.VERSION.SDK_INT < 31 || !SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext())) {
      call.reject("ON_DEVICE_ARABIC_RECOGNITION_UNAVAILABLE");
      return;
    }
    if (getPermissionState("microphone") != PermissionState.GRANTED) {
      requestPermissionForAlias("microphone", call, "microphonePermissionResult");
      return;
    }
    startOnDeviceRecognition(call);
  }

  @com.getcapacitor.annotation.PermissionCallback
  private void microphonePermissionResult(PluginCall call) {
    if (getPermissionState("microphone") != PermissionState.GRANTED) {
      call.reject("MICROPHONE_PERMISSION_DENIED");
      return;
    }
    startOnDeviceRecognition(call);
  }

  private void startOnDeviceRecognition(PluginCall call) {
    try {
      if (recognizer != null) { recognizer.destroy(); recognizer = null; }
      recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
      recognizer.setRecognitionListener(new RecognitionListener() {
        @Override public void onReadyForSpeech(Bundle params) { notifyListeners("speechReady", new JSObject()); }
        @Override public void onBeginningOfSpeech() {}
        @Override public void onRmsChanged(float rmsdB) {}
        @Override public void onBufferReceived(byte[] buffer) {}
        @Override public void onEndOfSpeech() { notifyListeners("speechEnd", new JSObject()); }
        @Override public void onError(int error) {
          JSObject data = new JSObject(); data.put("error", error);
          notifyListeners("speechError", data);
        }
        @Override public void onResults(Bundle results) { emitResult(results, true); }
        @Override public void onPartialResults(Bundle results) { emitResult(results, false); }
        @Override public void onEvent(int eventType, Bundle params) {}
      });
      Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
      intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
      intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-SA");
      intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
      intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
      recognizer.startListening(intent);
      call.resolve();
    } catch (Exception error) {
      call.reject("NATIVE_RECOGNITION_START_FAILED", error);
    }
  }

  private void emitResult(Bundle results, boolean isFinal) {
    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    if (matches == null || matches.isEmpty()) return;
    JSObject data = new JSObject(); data.put("transcript", matches.get(0)); data.put("isFinal", isFinal);
    notifyListeners("speechResult", data);
  }

  @PluginMethod public void stopListening(PluginCall call) {
    if (recognizer != null) { recognizer.stopListening(); recognizer.destroy(); recognizer = null; }
    call.resolve();
  }

  @PluginMethod public void speak(PluginCall call) {
    String text = call.getString("text", "");
    if (!ttsReady || text.trim().isEmpty()) { call.reject("ANDROID_TTS_NOT_READY"); return; }
    Locale language = Locale.forLanguageTag(call.getString("lang", "ar"));
    int languageStatus = tts.setLanguage(language);
    if (languageStatus == TextToSpeech.LANG_MISSING_DATA || languageStatus == TextToSpeech.LANG_NOT_SUPPORTED) {
      call.reject("ARABIC_TTS_LANGUAGE_DATA_UNAVAILABLE"); return;
    }
    tts.setSpeechRate((float) call.getDouble("rate", 0.92));
    String utteranceId = UUID.randomUUID().toString();
    tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
      @Override public void onStart(String id) {}
      @Override public void onDone(String id) { JSObject data = new JSObject(); data.put("utteranceId", id); notifyListeners("speechSynthesisDone", data); }
      @Override public void onError(String id) { JSObject data = new JSObject(); data.put("utteranceId", id); notifyListeners("speechSynthesisError", data); }
    });
    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId);
    call.resolve();
  }

  @PluginMethod public void stopSpeaking(PluginCall call) {
    if (tts != null) tts.stop();
    call.resolve();
  }

  @Override protected void handleOnDestroy() {
    if (recognizer != null) { recognizer.destroy(); recognizer = null; }
    if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
  }
}
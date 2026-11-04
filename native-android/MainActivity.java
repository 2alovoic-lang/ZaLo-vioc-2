package com.zalovoice.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override public void onCreate(android.os.Bundle savedInstanceState) {
    registerPlugin(SpeechBridgePlugin.class);
    super.onCreate(savedInstanceState);
  }
}
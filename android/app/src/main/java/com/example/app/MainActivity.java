package com.example.app;

import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // DEV ONLY: permitir que una app servida por https://localhost
    // pueda consumir endpoints http://... (Mixed Content)
    this.getBridge().getWebView().getSettings()
      .setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
  }
}

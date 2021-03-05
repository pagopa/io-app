// a loading component rendered during the webview loading times
import { StyleSheet, View } from "react-native";
import React from "react";
import WebView from "react-native-webview";
import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { fromNullable } from "fp-ts/lib/Option";
import { RefreshIndicator } from "../ui/RefreshIndicator";

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }
});
const renderLoading = () => (
  <View style={styles.refreshIndicatorContainer}>
    <RefreshIndicator />
  </View>
);
const localServicesUri =
  "https://604252d9556afc00079b0322--elated-archimedes-b3b6a6.netlify.app/app-content/enti-servizi.html";
const handleOnShouldStartLoadWithRequest = (navState: WebViewNavigation) => {
  if (navState.url) {
  }
  return true;
};

export const LocalServicesWebView = () => (
  <WebView
    style={{ flex: 1 }}
    textZoom={100}
    source={{
      uri: localServicesUri
    }}
    onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
    startInLoadingState={true}
    renderLoading={renderLoading}
    javaScriptEnabled={true}
  />
);

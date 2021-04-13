import { StyleSheet, View } from "react-native";
import React, { createRef, FC, useState } from "react";
import WebView from "react-native-webview";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../utils/webview";
import { RefreshIndicator } from "./ui/RefreshIndicator";
import GenericErrorComponent from "./screens/GenericErrorComponent";
import { withLightModalContext } from "./helpers/withLightModalContext";

// TODO: set the right uri
const URI = "http://localhost:5000/";

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  genericError: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
});

/** This component loads an url and show the assistance form */
const AssistanceForm: FC = () => {
  const [webViewError, setWebViewError] = useState(false);
  const webViewRef = createRef<WebView>();

  const renderLoading = () => (
    <View style={styles.refreshIndicatorContainer}>
      <RefreshIndicator />
    </View>
  );

  const reloadWebView = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setWebViewError(false);
    }
  };

  const onError = () => setWebViewError(true);

  return (
    <>
      <WebView
        ref={webViewRef}
        injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS)}
        style={{ flex: 1 }}
        textZoom={100}
        source={{ uri: URI }}
        onError={onError}
        renderLoading={renderLoading}
        startInLoadingState
        javaScriptEnabled
      />
      {webViewError && (
        <View style={styles.genericError}>
          <GenericErrorComponent onRetry={reloadWebView} />
        </View>
      )}
    </>
  );
};

export default withLightModalContext(AssistanceForm);

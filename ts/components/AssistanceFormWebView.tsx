import { StyleSheet, View } from "react-native";
import React, { createRef, FC, useState } from "react";
import WebView from "react-native-webview";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../utils/webview";
import GenericErrorComponent from "./screens/GenericErrorComponent";
import { withLightModalContext } from "./helpers/withLightModalContext";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { fromNullable } from "fp-ts/lib/Option";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { WebviewMessage } from "../types/WebviewMessage";
import { showToast } from "../utils/showToast";
import I18n from "../i18n";

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

const injectedJavascript = closeInjectedScript(
  AVOID_ZOOM_JS + APP_EVENT_HANDLER
);

/** This component loads an url and show the assistance form */
const AssistanceForm: FC = () => {
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = createRef<WebView>();

  const onLoadStart = () => setLoading(true);

  const onReload = () => {
    setHasError(false);
    setLoading(true);
    if (ref.current) ref.current.reload();
  };

  const onError = () => {
    setHasError(true);
    setLoading(false);
  };

  const injectJS = () => {
    fromNullable(ref.current).map(wv =>
      wv.injectJavaScript(injectedJavascript)
    );
    setLoading(false);
  };

  const onAssistanceFormData = (event: WebViewMessageEvent) => {
    const data = WebviewMessage.decode(JSON.parse(event.nativeEvent.data));

    if (data.isLeft()) return showToast(I18n.t("webView.error.convertMessage"));

    // TODO: choose what to do with this data
    console.log(data);
  };

  return (
    <LoadingSpinnerOverlay isLoading={loading}>
      {!hasError && (
        <View style={{ flex: 1 }}>
          <WebView
            ref={ref}
            source={{ uri: URI }}
            textZoom={100}
            onError={onError}
            onLoadStart={onLoadStart}
            onLoadEnd={injectJS}
            onMessage={onAssistanceFormData}
          />
        </View>
      )}
      {hasError && (
        <View style={styles.genericError}>
          <GenericErrorComponent onRetry={onReload} />
        </View>
      )}
    </LoadingSpinnerOverlay>
  );
};

export default withLightModalContext(AssistanceForm);

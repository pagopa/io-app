import WebView from "react-native-webview";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { View } from "native-base";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../../components/ui/RefreshIndicator";
import I18n from "../../../i18n";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../utils/webview";
import { internalRouteNavigationParamsSelector } from "../../../store/reducers/internalRouteNavigation";
import { useIOSelector } from "../../../store/hooks";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  errorContainer: {
    flex: 1,
    alignItems: "center"
  },
  errorTitle: {
    marginTop: 10
  }
});

const ErrorComponent = (props: { onRetry: () => void }) => (
  <LoadingErrorComponent
    loadingCaption={""}
    isLoading={false}
    onRetry={props.onRetry}
  />
);

// a loading component rendered during the webview loading states
const renderLoading = () => (
  <View style={styles.loading}>
    <RefreshIndicator />
  </View>
);

const handleOnMessage = (_?: WebViewMessageEvent) => {
  // TODO decode and handle the messages coming from the web page https://pagopa.atlassian.net/browse/IA-692
};

const injectedJavascript = closeInjectedScript(AVOID_ZOOM_JS);

export const UAWebViewScreen = () => {
  const navigationParams = useIOSelector(internalRouteNavigationParamsSelector);
  const uri = navigationParams?.urlToLoad;
  const ref = React.createRef<WebView>();
  const [hasError, setError] = useState(false);
  const errorComponent = (
    <ErrorComponent
      onRetry={() => {
        ref.current?.reload();
        setError(false);
      }}
    />
  );

  // inject JS to avoid the user can zoom the web page content
  const injectJS = () => {
    ref.current?.injectJavaScript(injectedJavascript);
  };

  const onError = () => {
    setError(true);
  };

  if (uri === undefined) {
    // TODO show an alert to inform the failure scenario https://pagopa.atlassian.net/browse/IA-706
    return null;
  }

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.uaDonations.webViewScreen.headerTitle")}
    >
      {!hasError ? (
        <WebView
          testID={"UAWebViewScreenTestID"}
          ref={ref}
          cacheEnabled={false}
          textZoom={100}
          source={{ uri }}
          onLoadEnd={injectJS}
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          onError={onError}
          onHttpError={onError}
          onMessage={handleOnMessage}
          startInLoadingState={true}
          renderLoading={renderLoading}
          javaScriptEnabled={true}
        />
      ) : (
        errorComponent
      )}
    </BaseScreenComponent>
  );
};

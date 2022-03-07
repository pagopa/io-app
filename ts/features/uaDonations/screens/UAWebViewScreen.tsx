import WebView from "react-native-webview";
import React, { useState } from "react";
import { Image, StyleSheet } from "react-native";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { View } from "native-base";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../../components/ui/RefreshIndicator";
import I18n from "../../../i18n";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../../../utils/webview";
import brokenLinkImage from "../../../../img/broken-link.png";
import { Label } from "../../../components/core/typography/Label";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { internalRouteNavigationParamsSelector } from "../../../store/reducers/internalRouteNavigation";
import { useIOSelector } from "../../../store/hooks";

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

const ErrorComponent = (props: { onRetry: () => void }) => {
  const cancelButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: props.onRetry,
    title: I18n.t("global.buttons.retry")
  };
  return (
    <View style={styles.errorContainer}>
      <View spacer={true} extralarge={true} />
      <View spacer={true} extralarge={true} />
      <Image source={brokenLinkImage} resizeMode="contain" />
      <Label style={styles.errorTitle} weight={"Bold"}>
        {I18n.t("authentication.errors.network.title")}
      </Label>
      <FooterWithButtons type={"SingleButton"} leftButton={cancelButtonProps} />
    </View>
  );
};

// a loading component rendered during the webview loading states
const renderLoading = () => (
  <View style={styles.loading}>
    <RefreshIndicator />
  </View>
);

const handleOnMessage = (_?: WebViewMessageEvent) => {
  // TODO decode and handle the messages coming from the web page https://pagopa.atlassian.net/browse/IA-692
};

const injectedJavascript = closeInjectedScript(
  AVOID_ZOOM_JS + APP_EVENT_HANDLER
);

export const UAWebViewScreen = () => {
  const navigation = useNavigationContext();
  const navigationParams = useIOSelector(internalRouteNavigationParamsSelector);
  const uri = navigationParams?.url;
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

  if (hasError) {
    return errorComponent;
  }

  return (
    <BaseScreenComponent
      goBack={navigation.goBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.uaDonations.webView.title")}
    >
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
    </BaseScreenComponent>
  );
};

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Text as NBButtonText } from "native-base";
import * as React from "react";
import { useCallback, useState } from "react";
import { Image, StyleSheet, View, ViewProps } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import brokenLinkImage from "../../img/broken-link.png";
import I18n from "../i18n";
import { openWebUrl } from "../utils/url";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../utils/webview";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import FooterWithButtons from "./ui/FooterWithButtons";
import { NOTIFY_LINK_CLICK_SCRIPT } from "./ui/Markdown/script";
import { WebViewMessage } from "./ui/Markdown/types";
import { VSpacer } from "./core/spacer/Spacer";
import { H2 } from "./core/typography/H2";

type Props = {
  webViewSource: WebViewSource;
  handleLoadEnd: () => void;
  handleReload: () => void;
  onAcceptTos?: () => void;
  onExit?: () => void;
  shouldRenderFooter?: boolean;
} & Pick<ViewProps, "testID">;

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  }
});

const TosWebviewComponent: React.FunctionComponent<Props> = ({
  handleLoadEnd,
  handleReload,
  webViewSource,
  shouldRenderFooter,
  onExit,
  onAcceptTos
}: Props) => {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    handleLoadEnd();
    setHasError(true);
  }, [setHasError, handleLoadEnd]);

  const handleRetry = useCallback(() => {
    handleReload();
    setHasError(false);
  }, [setHasError, handleReload]);

  const renderError = () => (
    <View style={styles.errorContainer} testID={"toSErrorContainerView"}>
      <Image
        source={brokenLinkImage}
        resizeMode="contain"
        testID={"toSErrorContainerImage"}
      />
      <View>
        <VSpacer size={8} />
        <H2 color="bluegrey" weight="Bold" testID={"toSErrorContainerTitle"}>
          {I18n.t("onboarding.tos.error")}
        </H2>
      </View>

      <View style={styles.errorButtonsContainer}>
        <ButtonDefaultOpacity
          onPress={handleRetry}
          style={{ flex: 2 }}
          block={true}
          primary={true}
          testID={"toSErrorContainerButton"}
        >
          <NBButtonText testID={"toSErrorContainerButtonText"}>
            {I18n.t("global.buttons.retry")}
          </NBButtonText>
        </ButtonDefaultOpacity>
      </View>
    </View>
  );

  // A function that handles message sent by the WebView component
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    pipe(
      JSON.parse(event.nativeEvent.data),
      WebViewMessage.decode,
      E.map(m => {
        if (m.type === "LINK_MESSAGE") {
          void openWebUrl(m.payload.href);
        }
      })
    );
  };

  return hasError ? (
    renderError()
  ) : (
    <>
      <View style={{ flex: 1 }} testID={"toSWebViewContainer"}>
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          textZoom={100}
          style={{ flex: 1 }}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          source={webViewSource}
          onMessage={handleWebViewMessage}
          injectedJavaScript={closeInjectedScript(
            AVOID_ZOOM_JS + NOTIFY_LINK_CLICK_SCRIPT
          )}
        />
      </View>
      {shouldRenderFooter && !hasError && (
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            block: true,
            bordered: true,
            onPress: onExit,
            title: I18n.t("global.buttons.exit"),
            testID: "toSWebViewContainerFooterLeftButton"
          }}
          rightButton={{
            block: true,
            primary: true,
            onPress: onAcceptTos,
            title: I18n.t("onboarding.tos.accept"),
            testID: "toSWebViewContainerFooterRightButton"
          }}
        />
      )}
    </>
  );
};

export default React.memo(TosWebviewComponent);

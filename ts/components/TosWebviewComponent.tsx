import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useCallback, useState } from "react";
import { View, ViewProps } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import {
  FooterWithButtons,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../i18n";
import { openWebUrl } from "../utils/url";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../utils/webview";
import {
  trackToSWebViewError,
  trackToSWebViewErrorRetry
} from "../screens/authentication/analytics";
import { FlowType } from "../utils/analytics";
import { NOTIFY_LINK_CLICK_SCRIPT } from "./ui/Markdown/script";
import { WebViewMessage } from "./ui/Markdown/types";

type Props = {
  webViewSource: WebViewSource;
  handleLoadEnd: () => void;
  handleReload: () => void;
  onAcceptTos?: () => void;
  shouldRenderFooter?: boolean;
  flow: FlowType;
} & Pick<ViewProps, "testID">;

const TosWebviewComponent: React.FunctionComponent<Props> = ({
  handleLoadEnd,
  handleReload,
  webViewSource,
  shouldRenderFooter,
  onAcceptTos,
  flow
}: Props) => {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    handleLoadEnd();
    setHasError(true);
    trackToSWebViewError(flow);
  }, [handleLoadEnd, flow]);

  const handleRetry = useCallback(() => {
    handleReload();
    setHasError(false);
    trackToSWebViewErrorRetry(flow);
  }, [handleReload, flow]);

  const renderError = () => (
    <>
      <View
        style={[
          IOStyles.flex,
          IOStyles.alignCenter,
          IOStyles.horizontalContentPadding,
          IOStyles.centerJustified
        ]}
        testID="toSErrorContainerView"
      >
        <Pictogram name="stopSecurity" />
        <VSpacer size={8} />
        <H3 testID="toSErrorContainerTitle" style={{ textAlign: "center" }}>
          {I18n.t("onboarding.tos.error")}
        </H3>
      </View>
      <FooterWithButtons
        type="SingleButton"
        sticky={true}
        primary={{
          type: "Solid",
          buttonProps: {
            onPress: () => handleRetry,
            label: I18n.t("global.buttons.retry"),
            accessibilityLabel: I18n.t("global.buttons.retry"),
            testID: "RetryButtonTest"
          }
        }}
      />
    </>
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
      <View style={IOStyles.flex} testID="toSWebViewContainer">
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          textZoom={100}
          style={IOStyles.flex}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          source={webViewSource}
          onMessage={handleWebViewMessage}
          injectedJavaScript={closeInjectedScript(
            AVOID_ZOOM_JS + NOTIFY_LINK_CLICK_SCRIPT
          )}
        />
      </View>
      {shouldRenderFooter && onAcceptTos && (
        <FooterWithButtons
          type="SingleButton"
          sticky={true}
          primary={{
            type: "Solid",
            buttonProps: {
              onPress: onAcceptTos,
              label: I18n.t("onboarding.tos.accept"),
              accessibilityLabel: I18n.t("onboarding.tos.accept"),
              testID: "AcceptToSButton"
            }
          }}
        />
      )}
    </>
  );
};

export default React.memo(TosWebviewComponent);

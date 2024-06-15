import { FooterWithButtons, IOStyles } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import React, { FunctionComponent, memo, useCallback, useState } from "react";
import { View, ViewProps } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import I18n from "../i18n";
import {
  trackToSWebViewError,
  trackToSWebViewErrorRetry
} from "../screens/authentication/analytics";
import { FlowType } from "../utils/analytics";
import { openWebUrl } from "../utils/url";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../utils/webview";
import TosWebviewErrorComponent from "./TosWebviewErrorComponent";
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

const TosWebviewComponent: FunctionComponent<Props> = ({
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
  }, [flow, handleLoadEnd]);

  const handleRetry = useCallback(() => {
    handleReload();
    setHasError(false);
    trackToSWebViewErrorRetry(flow);
  }, [flow, handleReload]);

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
    <TosWebviewErrorComponent handleRetry={handleRetry} />
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
          onHttpError={handleError}
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
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("onboarding.tos.accept"),
              onPress: onAcceptTos,
              testID: "AcceptToSButton"
            }
          }}
        />
      )}
    </>
  );
};

export default memo(TosWebviewComponent);

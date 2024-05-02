import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import React, { FunctionComponent, memo } from "react";
import { View, ViewProps } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import {
  ButtonSolid,
  ContentWrapper,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../i18n";
import { openWebUrl } from "../utils/url";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../utils/webview";
import { NOTIFY_LINK_CLICK_SCRIPT } from "./ui/Markdown/script";
import { WebViewMessage } from "./ui/Markdown/types";

type Props = {
  webViewSource: WebViewSource;
  handleLoadEnd: () => void;
  handleError?: () => void;
  handleReload: () => void;
  onAcceptTos?: () => void;
  shouldRenderFooter?: boolean;
  showError?: boolean;
} & Pick<ViewProps, "testID">;

const TosWebviewComponent: FunctionComponent<Props> = ({
  handleLoadEnd,
  handleError,
  handleReload,
  webViewSource,
  shouldRenderFooter,
  onAcceptTos,
  showError
}: Props) => {
  const ErrorComponent = () => (
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
      <ContentWrapper>
        <ButtonSolid
          fullWidth
          onPress={handleReload}
          label={I18n.t("global.buttons.retry")}
          testID="RetryButtonTest"
        />
      </ContentWrapper>
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

  return showError ? (
    <ErrorComponent />
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
        <ContentWrapper>
          <ButtonSolid
            fullWidth
            onPress={onAcceptTos}
            label={I18n.t("onboarding.tos.accept")}
            testID="AcceptToSButton"
          />
        </ContentWrapper>
      )}
    </>
  );
};

export default memo(TosWebviewComponent);

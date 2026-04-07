import {
  FooterActions,
  IOColors,
  useFooterActionsMeasurements,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { FunctionComponent, memo, useCallback, useState } from "react";
import { ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";

import { NOTIFY_LINK_CLICK_SCRIPT } from "../../../../../components/ui/Markdown/script";
import { WebViewMessage } from "../../../../../components/ui/Markdown/types";
import { FlowType } from "../../../../../utils/analytics";
import { openWebUrl } from "../../../../../utils/url";
import {
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../../../../../utils/webview";
import TosWebviewErrorComponent from "../../components/TosWebviewErrorComponent";
import { trackToSWebViewError, trackToSWebViewErrorRetry } from "../analytics";

type Props = Pick<ViewProps, "testID"> & {
  flow: FlowType;
  handleLoadEnd: () => void;
  handleReload: () => void;
  onAcceptTos?: () => void;
  shouldRenderFooter?: boolean;
  webViewSource: WebViewSource;
};

const TosWebviewComponent: FunctionComponent<Props> = ({
  handleLoadEnd,
  handleReload,
  webViewSource,
  shouldRenderFooter,
  onAcceptTos,
  flow
}: Props) => {
  const [hasError, setHasError] = useState(false);

  const showFooter = shouldRenderFooter && onAcceptTos;

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const theme = useIOTheme();

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
      <SafeAreaView
        edges={["bottom"]}
        style={{
          flex: 1,
          paddingBottom: showFooter
            ? footerActionsMeasurements.safeBottomAreaHeight
            : 0
        }}
        testID="toSWebViewContainer"
      >
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          injectedJavaScript={closeInjectedScript(
            AVOID_ZOOM_JS + NOTIFY_LINK_CLICK_SCRIPT
          )}
          onError={handleError}
          onHttpError={handleError}
          onLoadEnd={handleLoadEnd}
          onMessage={handleWebViewMessage}
          source={webViewSource}
          style={{
            flex: 1,
            backgroundColor: IOColors[theme["appBackground-primary"]]
          }}
          textZoom={100}
        />
      </SafeAreaView>
      {showFooter && (
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: I18n.t("onboarding.tos.accept"),
              onPress: onAcceptTos,
              testID: "AcceptToSButton"
            }
          }}
          onMeasure={handleFooterActionsMeasurements}
          transparent
        />
      )}
    </>
  );
};

export default memo(TosWebviewComponent);

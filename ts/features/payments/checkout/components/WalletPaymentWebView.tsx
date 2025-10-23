import { useRef, useState } from "react";
import WebView from "react-native-webview";
import { Linking } from "react-native";
import * as O from "fp-ts/lib/Option";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { isDevEnv } from "../../../../utils/environment";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";
import { PaymentStartWebViewPayload } from "../store/actions/orchestration";
import { getIntentFallbackUrl } from "../../../authentication/common/utils/login";

const originSchemasWhiteList = [
  "https://*",
  `${WALLET_WEBVIEW_OUTCOME_SCHEMA}://*`,
  "intent://*",
  "about:*",
  ...(isDevEnv ? ["http://*"] : [])
];

const WalletPaymentWebView = ({
  onSuccess,
  onCancel,
  onError,
  url: uri
}: PaymentStartWebViewPayload) => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const webViewRef = useRef<WebView>(null);

  useHardwareBackButton(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      onCancel?.(WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER);
    }
    return true;
  });

  return (
    <WebView
      testID="webview"
      ref={webViewRef}
      originWhitelist={originSchemasWhiteList}
      onShouldStartLoadWithRequest={event => {
        if (event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA)) {
          onSuccess?.(event.url);
        }
        if (event.url === "about:blank" && event.isTopFrame) {
          onCancel?.(WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER);
        }
        const intent = getIntentFallbackUrl(event.url);
        if (O.isSome(intent)) {
          void Linking.openURL(decodeURIComponent(intent.value));
          return false;
        }
        return !event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA);
      }}
      onNavigationStateChange={event => setCanGoBack(event.canGoBack)}
      onHttpError={() => onError?.(WalletPaymentOutcomeEnum.GENERIC_ERROR)}
      onError={() => onError?.(WalletPaymentOutcomeEnum.GENERIC_ERROR)}
      allowsBackForwardNavigationGestures
      style={{ flex: 1 }}
      source={{
        uri
      }}
      paymentRequestEnabled
      androidCameraAccessDisabled
      androidMicrophoneAccessDisabled
    />
  );
};

export default WalletPaymentWebView;

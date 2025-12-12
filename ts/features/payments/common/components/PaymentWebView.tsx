import { useRef, useState } from "react";
import WebView from "react-native-webview";
import { Linking } from "react-native";
import * as O from "fp-ts/lib/Option";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { isDevEnv } from "../../../../utils/environment";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import { getIntentFallbackUrl } from "../../../authentication/common/utils/login";

type PaymentWebViewProps<T> = {
  url: string;
  cancelOutcome: T;
  errorOutcome: T;
  onSuccess?: (url: string) => void;
  onCancel?: (outcome: T) => void;
  onError?: (outcome: T) => void;
  originWhiteList?: Array<string>;
};

const originSchemasWhiteList = [
  "https://*",
  `${WALLET_WEBVIEW_OUTCOME_SCHEMA}://*`,
  `${WALLET_WEBVIEW_OUTCOME_SCHEMA}://`,
  "intent://*",
  "about:*",
  ...(isDevEnv ? ["http://*"] : [])
];

const PaymentWebView = <T,>({
  onSuccess,
  onCancel,
  onError,
  url: uri,
  cancelOutcome,
  errorOutcome,
  originWhiteList
}: PaymentWebViewProps<T>) => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const webViewRef = useRef<WebView>(null);

  useHardwareBackButton(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      onCancel?.(cancelOutcome);
    }
    return true;
  });

  return (
    <WebView
      testID="webview"
      ref={webViewRef}
      originWhitelist={originWhiteList || originSchemasWhiteList}
      onShouldStartLoadWithRequest={event => {
        if (event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA)) {
          onSuccess?.(event.url);
        }
        if (event.url === "about:blank" && event.isTopFrame) {
          onCancel?.(cancelOutcome);
        }
        const intent = getIntentFallbackUrl(event.url);
        if (O.isSome(intent)) {
          void Linking.openURL(decodeURIComponent(intent.value));
          return false;
        }
        return !event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA);
      }}
      onNavigationStateChange={event => setCanGoBack(event.canGoBack)}
      onHttpError={() => {
        onError?.(errorOutcome);
      }}
      onError={() => {
        onError?.(errorOutcome);
      }}
      allowsBackForwardNavigationGestures
      style={{ flex: 1 }}
      source={{
        uri
      }}
      androidCameraAccessDisabled
      androidMicrophoneAccessDisabled
    />
  );
};

export default PaymentWebView;

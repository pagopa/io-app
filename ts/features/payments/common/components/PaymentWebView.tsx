import * as O from "fp-ts/lib/Option";
import { useRef, useState } from "react";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { isDevEnv } from "../../../../utils/environment";
import { getIntentFallbackUrl } from "../../../authentication/common/utils/login";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";

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
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <WebView
        testID="webview"
        ref={webViewRef}
        originWhitelist={originWhiteList || originSchemasWhiteList}
        onShouldStartLoadWithRequest={event => {
          const { url, isTopFrame } = event;
          if (url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA)) {
            onSuccess?.(url);
            return false;
          }
          if (url === "about:blank" && isTopFrame) {
            onCancel?.(cancelOutcome);
            return false;
          }
          const intent = getIntentFallbackUrl(url);
          if (O.isSome(intent)) {
            void Linking.openURL(decodeURIComponent(intent.value));
            return false;
          }
          return true;
        }}
        onNavigationStateChange={event => setCanGoBack(event.canGoBack)}
        onHttpError={() => {
          onError?.(errorOutcome);
        }}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;

          if (nativeEvent.url?.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA)) {
            // This is a "good" error.
            // We effectively ignore this error because onShouldStartLoadWithRequest handles the logic.
            return;
          }

          if (
            nativeEvent.code === -10 ||
            nativeEvent.description === "net::ERR_UNKNOWN_URL_SCHEME"
          ) {
            return;
          }

          onError?.(errorOutcome);
        }}
        allowsBackForwardNavigationGestures
        style={{ flex: 1 }}
        source={{
          uri
        }}
        paymentRequestEnabled
        androidCameraAccessDisabled
        androidMicrophoneAccessDisabled
      />
    </SafeAreaView>
  );
};

export default PaymentWebView;

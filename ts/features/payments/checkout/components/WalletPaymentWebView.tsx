import { useRef, useState } from "react";
import WebView from "react-native-webview";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { isDevEnv } from "../../../../utils/environment";
import { getNetworkError, NetworkError } from "../../../../utils/errors";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";

const originSchemasWhiteList = [
  "https://*",
  "iowallet://*",
  ...(isDevEnv ? ["http://*"] : [])
];

type Props = {
  onSuccess?: (url: string) => void;
  onError?: (error: NetworkError) => void;
  uri: string;
};

const WalletPaymentWebView = ({ onSuccess, onError, uri }: Props) => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const webViewRef = useRef<WebView>(null);

  useHardwareBackButton(() => {
    const error = getNetworkError("WalletPaymentWebViewScreen");
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      onError?.(error);
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
        if (event.url === "about:blank") {
          onError?.(getNetworkError("WalletPaymentWebViewScreen"));
        }
        return !event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA);
      }}
      onNavigationStateChange={event => setCanGoBack(event.canGoBack)}
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

export default WalletPaymentWebView;

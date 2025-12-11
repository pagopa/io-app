import { useRef, useState } from "react";
import WebView from "react-native-webview";
import { Linking } from "react-native";
import * as O from "fp-ts/lib/Option";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { isDevEnv } from "../../../../utils/environment";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import { getIntentFallbackUrl } from "../../../authentication/common/utils/login";
import { WalletOnboardingOutcomeEnum } from "../../onboarding/types/OnboardingOutcomeEnum";
import { ContextualOnboardingWebViewPayload } from "../store/actions";

const originSchemasWhiteList = [
  "https://*",
  `${WALLET_WEBVIEW_OUTCOME_SCHEMA}://*`,
  "intent://*",
  "about:*",
  ...(isDevEnv ? ["http://*"] : [])
];

const WalletContextualOnboardingWebView = ({
  onSuccess,
  onCancel,
  onError,
  url: uri
}: ContextualOnboardingWebViewPayload) => {
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const webViewRef = useRef<WebView>(null);

  useHardwareBackButton(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      onCancel?.(WalletOnboardingOutcomeEnum.CANCELED_BY_USER);
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
          onCancel?.(WalletOnboardingOutcomeEnum.CANCELED_BY_USER);
        }
        const intent = getIntentFallbackUrl(event.url);
        if (O.isSome(intent)) {
          void Linking.openURL(decodeURIComponent(intent.value));
          return false;
        }
        return !event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA);
      }}
      onNavigationStateChange={event => setCanGoBack(event.canGoBack)}
      onHttpError={() => onError?.(WalletOnboardingOutcomeEnum.GENERIC_ERROR)}
      onError={() => onError?.(WalletOnboardingOutcomeEnum.GENERIC_ERROR)}
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

export default WalletContextualOnboardingWebView;

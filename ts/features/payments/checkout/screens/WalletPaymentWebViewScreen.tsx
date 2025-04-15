import { WebView } from "react-native-webview";
import { useIOSelector } from "../../../../store/hooks";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import { walletPaymentWebViewPayloadSelector } from "../store/selectors";
import { isDevEnv } from "../../../../utils/environment";

const WalletPaymentWebViewScreen = () => {
  const payload = useIOSelector(walletPaymentWebViewPayloadSelector);

  const originSchemasWhiteList = [
    "https://*",
    "iowallet://*",
    ...(isDevEnv ? ["http://*"] : [])
  ];

  return (
    <WebView
      originWhitelist={originSchemasWhiteList}
      onShouldStartLoadWithRequest={event => {
        if (event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA)) {
          payload?.onSuccess?.(event.url);
        }
        return !event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA);
      }}
      style={{ flex: 1 }}
      source={{ uri: payload?.url ?? "" }}
      androidCameraAccessDisabled
      androidMicrophoneAccessDisabled
    />
  );
};

export default WalletPaymentWebViewScreen;

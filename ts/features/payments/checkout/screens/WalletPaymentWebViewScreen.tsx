import { WebView } from "react-native-webview";
import { useIOSelector } from "../../../../store/hooks";
import { WALLET_WEBVIEW_OUTCOME_SCHEMA } from "../../common/utils/const";
import { walletPaymentWebViewPayloadSelector } from "../store/selectors";

const WalletPaymentWebViewScreen = () => {
  const payload = useIOSelector(walletPaymentWebViewPayloadSelector);

  return (
    <WebView
      originWhitelist={["iowallet://*"]}
      onShouldStartLoadWithRequest={event => {
        if (event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA)) {
          payload?.onSuccess?.(event.url);
        }
        return !event.url.startsWith(WALLET_WEBVIEW_OUTCOME_SCHEMA);
      }}
      style={{ flex: 1 }}
      source={{ uri: payload?.url ?? "" }}
    />
  );
};

export default WalletPaymentWebViewScreen;

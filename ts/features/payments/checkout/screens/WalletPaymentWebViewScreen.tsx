import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useIOSelector } from "../../../../store/hooks";
import WalletPaymentWebView from "../components/WalletPaymentWebView";
import { walletPaymentWebViewPayloadSelector } from "../store/selectors";

const WalletPaymentWebViewScreen = () => {
  const payload = useIOSelector(walletPaymentWebViewPayloadSelector);

  const navigation = useNavigation();

  useEffect(() => {
    // Disable swipe gesure from parent navigator
    navigation.getParent()?.setOptions({ gestureEnabled: false });

    // Re-enable gesture on unmount
    return () => {
      navigation.getParent()?.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);

  return payload?.url ? (
    <WalletPaymentWebView
      onError={payload.onError}
      onCancel={payload.onCancel}
      onSuccess={payload.onSuccess}
      url={payload.url}
    />
  ) : (
    <LoadingSpinnerOverlay isLoading />
  );
};

export default WalletPaymentWebViewScreen;

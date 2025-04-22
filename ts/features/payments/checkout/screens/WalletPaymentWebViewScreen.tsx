import { useEffect, useLayoutEffect } from "react";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useIOSelector } from "../../../../store/hooks";
import WalletPaymentWebView from "../components/WalletPaymentWebView";
import { walletPaymentWebViewPayloadSelector } from "../store/selectors";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";

const WalletPaymentWebViewScreen = () => {
  const payload = useIOSelector(walletPaymentWebViewPayloadSelector);

  const navigation = useIONavigation();

  useEffect(() => {
    // Disable swipe gesure from parent navigator
    navigation.getParent()?.setOptions({ gestureEnabled: false });

    // Re-enable gesture on unmount
    return () => {
      navigation.getParent()?.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);

  const handleConfirmClose = () => {
    payload?.onCancel?.(WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER);
  };

  const handleCloseAlert = () => {
    // TODO: Add the mixpanel tracking event (https://pagopa.atlassian.net/browse/IOBP-1580)
  };

  const promptUserToClose = () =>
    Alert.alert(I18n.t("wallet.payment.abortDialog.title"), undefined, [
      {
        text: I18n.t("wallet.payment.abortDialog.confirm"),
        style: "destructive",
        onPress: handleConfirmClose
      },
      {
        text: I18n.t("wallet.payment.abortDialog.cancel"),
        style: "cancel",
        onPress: handleCloseAlert
      }
    ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: promptUserToClose
          }}
        />
      )
    });
  });

  return payload?.url ? (
    <WalletPaymentWebView
      onError={payload.onError}
      onCancel={promptUserToClose}
      onSuccess={payload.onSuccess}
      url={payload.url}
    />
  ) : (
    <LoadingSpinnerOverlay isLoading />
  );
};

export default WalletPaymentWebViewScreen;

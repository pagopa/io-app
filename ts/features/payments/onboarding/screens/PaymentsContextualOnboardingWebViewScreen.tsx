import { useEffect, useLayoutEffect } from "react";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useIOSelector } from "../../../../store/hooks";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { WalletOnboardingOutcomeEnum } from "../types/OnboardingOutcomeEnum";
import { walletContextualOnboardingWebViewPayloadSelector } from "../../checkout/store/selectors";
import PaymentWebView from "../../common/components/PaymentWebView";

const PaymentsContextualOnboardingWebViewScreen = () => {
  const payload = useIOSelector(
    walletContextualOnboardingWebViewPayloadSelector
  );

  const navigation = useIONavigation();

  useEffect(() => {
    // Disable swipe gesure
    navigation.setOptions({ gestureEnabled: false });

    // Re-enable gesture on unmount
    return () => {
      navigation.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);

  const handleConfirmClose = () => {
    navigation.pop();
    payload?.onCancel?.(WalletOnboardingOutcomeEnum.CANCELED_BY_USER);
  };

  const handleOnSuccess = (url: string) => {
    navigation.goBack();
    payload?.onSuccess?.(url);
  };

  const handleOnError = (error?: WalletOnboardingOutcomeEnum) => {
    navigation.pop();
    payload?.onError?.(error);
  };

  const handleCloseAlert = () => {
    // TODO: Add android webview contextual onboarding analytics
  };

  const promptUserToClose = () => {
    // TODO: Add android webview contextual onboarding analytics
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
  };

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
    <PaymentWebView<WalletOnboardingOutcomeEnum>
      cancelOutcome={WalletOnboardingOutcomeEnum.CANCELED_BY_USER}
      errorOutcome={WalletOnboardingOutcomeEnum.GENERIC_ERROR}
      onError={handleOnError}
      onCancel={promptUserToClose}
      onSuccess={handleOnSuccess}
      url={payload.url}
    />
  ) : (
    <LoadingSpinnerOverlay isLoading />
  );
};

export default PaymentsContextualOnboardingWebViewScreen;

import { HeaderSecondLevel } from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useLayoutEffect } from "react";
import { Alert } from "react-native";

import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { walletContextualOnboardingWebViewPayloadSelector } from "../../checkout/store/selectors";
import PaymentWebView from "../../common/components/PaymentWebView";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import { WalletOnboardingOutcomeEnum } from "../types/OnboardingOutcomeEnum";

const PaymentsContextualOnboardingWebViewScreen = () => {
  const payload = useIOSelector(
    walletContextualOnboardingWebViewPayloadSelector
  );

  const navigation = useIONavigation();
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const savedPaymentMethods =
    paymentAnalyticsData?.savedPaymentMethods?.length ?? 0;

  useEffect(() => {
    // Disable swipe gesure
    navigation.setOptions({ gestureEnabled: false });

    // Re-enable gesture on unmount
    return () => {
      navigation.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);

  const handleConfirmClose = () => {
    analytics.trackPaymentOnboardingUserCancellationContinue({
      savedPaymentMethods
    });
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
    analytics.trackPaymentOnboardingUserCancellationBack({
      savedPaymentMethods
    });
  };

  const promptUserToClose = () => {
    analytics.trackPaymentOnboardingUserCancellationRequest({
      savedPaymentMethods
    });
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
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: promptUserToClose
          }}
          title=""
          type="singleAction"
        />
      )
    });
  });

  return payload?.url ? (
    <PaymentWebView<WalletOnboardingOutcomeEnum>
      cancelOutcome={WalletOnboardingOutcomeEnum.CANCELED_BY_USER}
      errorOutcome={WalletOnboardingOutcomeEnum.GENERIC_ERROR}
      onCancel={promptUserToClose}
      onError={handleOnError}
      onSuccess={handleOnSuccess}
      url={payload.url}
    />
  ) : (
    <LoadingSpinnerOverlay isLoading />
  );
};

export default PaymentsContextualOnboardingWebViewScreen;

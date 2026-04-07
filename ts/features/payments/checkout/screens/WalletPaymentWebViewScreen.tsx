import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect, useLayoutEffect } from "react";
import { Alert } from "react-native";

import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import PaymentWebView from "../../common/components/PaymentWebView";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import { walletPaymentWebViewPayloadSelector } from "../store/selectors";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";

const WalletPaymentWebViewScreen = () => {
  const payload = useIOSelector(walletPaymentWebViewPayloadSelector);
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const navigation = useIONavigation();

  useEffect(() => {
    // Disable swipe gesure from parent navigator
    navigation.getParent()?.setOptions({ gestureEnabled: false });

    // Re-enable gesture on unmount
    return () => {
      navigation.getParent()?.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);

  const dataToTrack = {
    attempt: paymentAnalyticsData?.attempt,
    organization_name: paymentAnalyticsData?.verifiedData?.paName,
    organization_fiscal_code: paymentAnalyticsData?.verifiedData?.paFiscalCode,
    amount: paymentAnalyticsData?.formattedAmount,
    saved_payment_method:
      paymentAnalyticsData?.savedPaymentMethods?.length ?? 0,
    expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
    payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
    selected_psp_flag: paymentAnalyticsData?.selectedPspFlag,
    data_entry: paymentAnalyticsData?.startOrigin,
    browser_type: paymentAnalyticsData?.browserType
  };

  const handleConfirmClose = () => {
    analytics.trackPaymentUserCancellationContinue(dataToTrack);
    payload?.onCancel?.(WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER);
  };

  const handleCloseAlert = () => {
    analytics.trackPaymentUserCancellationBack(dataToTrack);
  };

  const promptUserToClose = () => {
    analytics.trackPaymentUserCancellationRequest(dataToTrack);
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
    <PaymentWebView<WalletPaymentOutcomeEnum>
      cancelOutcome={WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER}
      errorOutcome={WalletPaymentOutcomeEnum.GENERIC_ERROR}
      onCancel={promptUserToClose}
      onError={payload.onError}
      onSuccess={payload.onSuccess}
      url={payload.url}
    />
  ) : (
    <LoadingSpinnerOverlay isLoading />
  );
};

export default WalletPaymentWebViewScreen;

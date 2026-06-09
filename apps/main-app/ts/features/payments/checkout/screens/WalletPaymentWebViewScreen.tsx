import { useEffect, useLayoutEffect } from "react";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useIOSelector } from "../../../../store/hooks";
import { walletPaymentWebViewPayloadSelector } from "../store/selectors";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";
import * as analytics from "../analytics";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import PaymentWebView from "../../common/components/PaymentWebView";

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
    <PaymentWebView<WalletPaymentOutcomeEnum>
      cancelOutcome={WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER}
      errorOutcome={WalletPaymentOutcomeEnum.GENERIC_ERROR}
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

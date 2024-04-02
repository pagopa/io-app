import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { paymentsGetPaymentUserMethodsAction } from "../../checkout/store/actions/networking";
import PaymentHistorySection from "../components/PaymentsHomeScreenHistorySection";
import PaymentMethodsSection from "../components/PaymentsHomeScreenMethodsSection";
import { isAnySectionSomeOrLoadingSelector } from "../store/selectors";
import { useTransactionHistory } from "../utils/hooks/useTransactionHistory";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsCheckoutRoutes } from "../../checkout/navigation/routes";

export const PaymentsHomeScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const { loadFirstHistoryPage } = useTransactionHistory();
  const shouldRenderEmptyState = !useIOSelector(
    isAnySectionSomeOrLoadingSelector
  );

  const fetchData = React.useCallback(() => {
    dispatch(paymentsGetPaymentUserMethodsAction.request());
    loadFirstHistoryPage();
  }, [dispatch, loadFirstHistoryPage]);
  useFocusEffect(fetchData);

  if (shouldRenderEmptyState) {
    return <></>;
  }

  // let the single components handle empty cases.
  //
  // else if neither is some/loading, render empty page.

  const handleOnPayNoticedPress = () => {
    navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
      screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER
    });
  };

  return (
    <GradientScrollView
      primaryActionProps={{
        accessibilityLabel: I18n.t("payment.homeScreen.CTA"),
        label: I18n.t("payment.homeScreen.CTA"),
        onPress: handleOnPayNoticedPress,
        icon: "qrCode",
        iconPosition: "end"
      }}
      excludeSafeAreaMargins={true}
    >
      <PaymentMethodsSection />
      <VSpacer size={24} />
      <PaymentHistorySection />
    </GradientScrollView>
  );
};

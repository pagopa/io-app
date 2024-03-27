import { HeaderFirstLevel, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentGetUserWallets } from "../../payment/store/actions/networking";
import PaymentHistorySection from "../components/PaymentsHomeScreenHistorySection";
import PaymentMethodsSection from "../components/PaymentsHomeScreenMethodsSection";
import { isAnySectionSomeOrLoadingSelector } from "../store/selectors";
import { useTransactionHistory } from "../utils/hooks/useTransactionHistory";

export const PaymentsHomeScreen = () => {
  const dispatch = useIODispatch();
  const { loadFirstHistoryPage } = useTransactionHistory();
  const shouldRenderEmptyState = !useIOSelector(
    isAnySectionSomeOrLoadingSelector
  );

  const fetchData = React.useCallback(() => {
    dispatch(walletPaymentGetUserWallets.request());
    loadFirstHistoryPage();
  }, [dispatch, loadFirstHistoryPage]);
  useFocusEffect(fetchData);

  if (shouldRenderEmptyState) {
    return <></>;
  }

  // let the single components handle empty cases.
  //
  // else if neither is some/loading, render empty page.

  return (
    <>
      <HeaderFirstLevel
        title={I18n.t("payment.homeScreen.title")}
        type="singleAction"
        firstAction={{
          accessibilityLabel: I18n.t("payment.homeScreen.title"),
          icon: "help",
          onPress: () => null
        }}
      />
      <VSpacer size={24} />
      <PaymentMethodsSection />
      <VSpacer size={24} />
      <PaymentHistorySection />
    </>
  );
};

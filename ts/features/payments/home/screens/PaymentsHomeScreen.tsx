import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { paymentsGetPaymentUserMethodsAction } from "../../checkout/store/actions/networking";
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

  return (
    <>
      <PaymentMethodsSection />
      <VSpacer size={24} />
      <PaymentHistorySection />
    </>
  );
};

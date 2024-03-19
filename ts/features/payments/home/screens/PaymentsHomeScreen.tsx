import { HeaderFirstLevel, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { createSelector } from "reselect";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentGetUserWallets } from "../../payment/store/actions/networking";
import { walletPaymentUserWalletsSelector } from "../../payment/store/selectors";
import PaymentHistorySection from "../components/PaymentsHomeScreenHistorySection";
import PaymentMethodsSection from "../components/PaymentsHomeScreenMethodsSection";
import { walletTransactionHistorySelector } from "../store/selectors";
import { useTransactionHistory } from "../utils/hooks/useTransactionHistory";

/* "rendering truth table" for both pots goes as such
 *          SOME | NONE
 * LOADING    X  |  X
 * ERROR      X  |  O
 * -          X  |  O
 *
 * we need to make sure that only in O case we render the empty state
 */
const anySectionSomeOrLoading = createSelector(
  walletPaymentUserWalletsSelector,
  walletTransactionHistorySelector,
  (userWallets, transactions) => {
    const shouldRenderMethods =
      pot.isSome(userWallets) || pot.isLoading(userWallets);
    const shouldRenderHistory =
      pot.isSome(transactions) || pot.isLoading(transactions);
    return shouldRenderMethods || shouldRenderHistory;
  }
);

export const PaymentsHomeScreen = () => {
  const dispatch = useIODispatch();
  const { loadFirstHistoryPage } = useTransactionHistory();
  const shouldRenderEmptyState = !useIOSelector(anySectionSomeOrLoading);

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

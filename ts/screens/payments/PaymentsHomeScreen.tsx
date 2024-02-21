import { HeaderFirstLevel, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { selectWalletPaymentHistoryArchive } from "../../features/walletV3/history/store/selectors";
import PaymentMethodsSection from "../../features/walletV3/payment/components/homeScreen/PaymentsHomeScreenMethodsSection";
import PaymentHistorySection from "../../features/walletV3/payment/components/homeScreen/PaymentsHomeScreenPaymentHistorySection";
import { walletPaymentGetUserWallets } from "../../features/walletV3/payment/store/actions/networking";
import { walletPaymentUserWalletsSelector } from "../../features/walletV3/payment/store/selectors";
import I18n from "../../i18n";
import { useIODispatch, useIOSelector } from "../../store/hooks";

export const PaymentsHomeScreen = () => {
  const dispatch = useIODispatch();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetUserWallets.request());
    }, [dispatch])
  );

  const paymentMethodsPot = useIOSelector(walletPaymentUserWalletsSelector);
  const paymentHistory = useIOSelector(selectWalletPaymentHistoryArchive) ?? [];

  const paymentMethods = pipe(
    paymentMethodsPot,
    pot.toOption,
    O.fold(
      () => [],
      methods => methods
    )
  );

  // if pot.isSome(cards)|| pot.isSome(history) then load,
  // let the single components handle empty cases.
  //
  // else if neither is some, render empty page.

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

      {paymentMethods.length !== 0 && ( // will be handled by component in next PR
        <PaymentMethodsSection methods={paymentMethods} />
      )}

      <VSpacer size={24} />

      {paymentHistory.length !== 0 && ( // will be handled by component in next PR
        <PaymentHistorySection history={paymentHistory} />
      )}
    </>
  );
};

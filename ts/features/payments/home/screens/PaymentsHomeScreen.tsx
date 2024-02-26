import { HeaderFirstLevel, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentGetUserWallets } from "../../payment/store/actions/networking";
import { selectWalletPaymentHistoryArchive } from "../../history/store/selectors";
import { walletPaymentUserWalletsSelector } from "../../payment/store/selectors";
import PaymentMethodsSection from "../components/PaymentsHomeScreenMethodsSection";
import PaymentHistorySection from "../components/PaymentsHomeScreenHistorySection";

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

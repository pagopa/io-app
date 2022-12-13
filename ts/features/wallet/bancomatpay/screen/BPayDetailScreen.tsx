import { Route, useRoute } from "@react-navigation/native";
import * as React from "react";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { useIOSelector } from "../../../../store/hooks";
import { paymentMethodByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { BPayPaymentMethod, isBPay } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import BPayCard from "../component/BPayCard";

export type BPayDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  bPay: BPayPaymentMethod;
}>;

/**
 * Detail screen for a Bancomat Pay
 * @constructor
 */
export const BPayDetailScreen: React.FunctionComponent = () => {
  const route =
    useRoute<Route<"WALLET_BPAY_DETAIL", BPayDetailScreenNavigationParams>>();
  const bPayId = route.params.bPay.idWallet;
  const bPay = useIOSelector(s => paymentMethodByIdSelector(s, bPayId));
  // it should never happen
  if (!isBPay(bPay)) {
    return <WorkunitGenericFailure />;
  }
  return (
    <BasePaymentMethodScreen
      paymentMethod={bPay}
      card={<BPayCard phone={bPay.info.numberObfuscated} />}
      content={<PaymentMethodFeatures paymentMethod={bPay} />}
    />
  );
};

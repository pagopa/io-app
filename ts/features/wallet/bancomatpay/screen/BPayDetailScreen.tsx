import { Route, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { useIOSelector } from "../../../../store/hooks";
import { paymentMethodByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { BPayPaymentMethod, isBPay } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import {
  PaymentCardBig,
  PaymentCardBigProps
} from "../../../payments/common/components/PaymentCardBig";

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
  const nameSurname = useIOSelector(profileNameSurnameSelector);
  // it should never happen
  if (!isBPay(bPay)) {
    return <WorkunitGenericFailure />;
  }
  const cardProps = pipe(
    bPay,
    // as with card, they technically should never be undefined,
    // but in the remote case they were we'd rather show a skeleton
    ({ info }) =>
      sequenceS(O.Monad)({
        cardType: O.some("BANCOMATPAY"),
        phoneNumber: O.fromNullable(info.numberObfuscated),
        holderName: O.fromNullable(nameSurname)
      }) as O.Option<PaymentCardBigProps>,
    O.getOrElse((): PaymentCardBigProps => ({ isLoading: true }))
  );
  return (
    <BasePaymentMethodScreen
      headerTitle="BANCOMAT Pay"
      paymentMethod={bPay}
      card={<PaymentCardBig {...cardProps} />}
      content={<PaymentMethodFeatures paymentMethod={bPay} />}
    />
  );
};

import { CompatNavigationProp } from "@react-navigation/compat";
import * as React from "react";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
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

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<WalletParamsList, "WALLET_BPAY_DETAIL">
  >;
};

/**
 * Detail screen for a Bancomat Pay
 * @constructor
 */
export const BPayDetailScreen: React.FunctionComponent<Props> = props => {
  const bPayId = props.navigation.getParam("bPay").idWallet;
  const bPay = useIOSelector(s => paymentMethodByIdSelector(s, bPayId));
  // it should never happen
  if (!isBPay(bPay)) {
    return <WorkunitGenericFailure />;
  }
  return (
    <BasePaymentMethodScreen
      paymentMethod={bPay}
      card={
        <BPayCard
          phone={bPay.info.numberObfuscated}
          bankName={bPay.caption}
          abiLogo={bPay.abiInfo?.logoUrl}
        />
      }
      content={<PaymentMethodFeatures paymentMethod={bPay} />}
    />
  );
};

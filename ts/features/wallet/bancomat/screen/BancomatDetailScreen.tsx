import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { PaymentCardBig } from "../../../../components/ui/cards/payment/PaymentCardBig";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import { paymentMethodByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { BancomatPaymentMethod, isBancomat } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";

export type BancomatDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  bancomat: BancomatPaymentMethod;
}>;

type Props = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_BANCOMAT_DETAIL"
>;

const bancomatScreenContent = (bancomat: BancomatPaymentMethod) => (
  <>
    <VSpacer size={8} />
    <ItemSeparatorComponent noPadded={true} />
    <VSpacer size={16} />
    <PaymentMethodFeatures paymentMethod={bancomat} />
  </>
);

/**
 * Detail screen for a bancomat
 * @constructor
 */
const BancomatDetailScreen = ({ route }: Props) => {
  const bancomat = useIOSelector(state =>
    paymentMethodByIdSelector(state, route.params.bancomat.idWallet)
  );
  const nameSurname = useIOSelector(profileNameSurnameSelector);
  // should never happen
  if (!isBancomat(bancomat)) {
    return <WorkunitGenericFailure />;
  }
  const cardData = pipe(
    bancomat,
    // as with card, they technically should never be undefined,
    // but in the remote case they were we'd rather show a skeleton
    ({ info, abiInfo }) =>
      sequenceS(O.Monad)({
        abiCode: O.fromNullable(abiInfo?.abi),
        holderName: O.fromNullable(nameSurname),
        expireMonth: O.fromNullable(info.expireMonth),
        expireYear: O.fromNullable(info.expireYear)
      }),
    O.map(cardData => ({
      ...cardData,
      expirationDate: new Date(
        Number(cardData.expireYear),
        Number(cardData.expireMonth)
      )
    }))
  );

  const cardComponent = pipe(
    cardData,
    O.fold(
      () => <PaymentCardBig isLoading />,
      cardData => <PaymentCardBig cardType="PAGOBANCOMAT" {...cardData} />
    )
  );
  return (
    <BasePaymentMethodScreen
      paymentMethod={bancomat}
      card={cardComponent}
      content={bancomatScreenContent(bancomat)}
    />
  );
};

export default BancomatDetailScreen;

import { Banner } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Route, useRoute } from "@react-navigation/native";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { PaymentCardBig } from "../../../../components/ui/cards/payment/PaymentCardBig";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import { paymentMethodByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { BancomatPaymentMethod, isBancomat } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import { acceptedPaymentMethodsFaqUrl } from "../../../../urls";

export type BancomatDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  bancomat: BancomatPaymentMethod;
}>;

/**
 * Detail screen for a bancomat
 * @constructor
 */
const BancomatDetailScreen = () => {
  const { idWallet } =
    useRoute<
      Route<"WALLET_BANCOMAT_DETAIL", BancomatDetailScreenNavigationParams>
    >().params.bancomat;
  const bancomat = useIOSelector(state =>
    paymentMethodByIdSelector(state, idWallet)
  );
  const bannerViewRef = React.useRef(null);
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
        abiCode: O.some(abiInfo?.abi),
        holderName: O.fromNullable(nameSurname),
        expireMonth: O.fromNullable(info.expireMonth),
        expireYear: O.fromNullable(info.expireYear),
        bankName: O.some(abiInfo?.name)
      }),
    O.map(cardData => ({
      ...cardData,
      expirationDate: new Date(
        Number(cardData.expireYear),
        // month is 0 based, BE res is not
        Number(cardData.expireMonth) - 1
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
      headerTitle="PagoBANCOMAT"
      content={
        <Banner
          pictogramName="help"
          size="big"
          color="neutral"
          viewRef={bannerViewRef}
          title={I18n.t("wallet.methodDetails.isSupportedBanner.title")}
          content={I18n.t("wallet.methodDetails.isSupportedBanner.content")}
          action={I18n.t("wallet.methodDetails.isSupportedBanner.cta")}
          onPress={() =>
            openAuthenticationSession(acceptedPaymentMethodsFaqUrl, "")
          }
        />
      }
    />
  );
};

export default BancomatDetailScreen;

import { Banner, IOLogoPaymentExtType } from "@pagopa/io-app-design-system";
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
import { creditCardByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { acceptedPaymentMethodsFaqUrl } from "../../../../urls";
import { isCobadge } from "../../../../utils/paymentMethodCapabilities";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";

export type CobadgeDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  cobadge: CreditCardPaymentMethod;
}>;

/**
 * Detail screen for a cobadge card
 * @constructor
 */
const CobadgeDetailScreen = () => {
  const { cobadge } =
    useRoute<
      Route<"WALLET_COBADGE_DETAIL", CobadgeDetailScreenNavigationParams>
    >().params;
  const card = useIOSelector(state =>
    creditCardByIdSelector(state, cobadge.idWallet)
  );
  const bannerViewRef = React.useRef(null);
  if (card === undefined || !isCobadge(card)) {
    return <WorkunitGenericFailure />;
  }
  const paymentCardData = pipe(
    cobadge,
    ({ info, abiInfo }) =>
      sequenceS(O.Monad)({
        // all or nothing, if one of these is missing we don't show the card
        blurredNumber: O.fromNullable(info.blurredNumber),
        expireMonth: O.fromNullable(info.expireMonth),
        expireYear: O.fromNullable(info.expireYear),
        holderName: O.fromNullable(info.holder),
        cardIcon: O.fromNullable(info.brand) as O.Option<IOLogoPaymentExtType>,
        abiCode: O.some(abiInfo?.abi),
        bankName: O.some(abiInfo?.name)
        // store gives it as string,
        // is later checked by component and null case is handled
      }),
    O.map(cardData => ({
      ...cardData,
      expirationDate: new Date(
        Number(cardData.expireYear),
        // month is 0 based, BE response is not
        Number(cardData.expireMonth) - 1
      )
    }))
  );

  const cardComponent = pipe(
    paymentCardData,
    O.fold(
      () => <PaymentCardBig testID="CreditCardComponent" isLoading={true} />,
      data => <PaymentCardBig cardType="COBADGE" {...data} />
    )
  );
  return (
    <BasePaymentMethodScreen
      paymentMethod={cobadge}
      card={cardComponent}
      headerTitle={I18n.t("wallet.methodDetails.cobadgeTitle")}
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

export default CobadgeDetailScreen;

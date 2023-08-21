import { Banner, IOLogoPaymentExtType } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { PaymentCardBig } from "../../../../components/ui/cards/payment/PaymentCardBig";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { creditCardByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { isCobadge } from "../../../../utils/paymentMethodCapabilities";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import I18n from "../../../../i18n";
import { acceptedPaymentMethodsFaqUrl } from "../../../../urls";

export type CobadgeDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  cobadge: CreditCardPaymentMethod;
}>;

type Props = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_COBADGE_DETAIL"
>;

/**
 * Detail screen for a cobadge card
 * @constructor
 */
const CobadgeDetailScreen = (props: Props) => {
  const { cobadge } = props.route.params;
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
        holder: O.fromNullable(info.holder),
        brand: O.fromNullable(info.brand as IOLogoPaymentExtType | undefined),
        abiCode: O.some(abiInfo?.abi)
        // store gives it as string,
        // is later checked by component and null case is handled
      }),
    O.map(cardData => ({
      ...cardData,
      expDate: new Date(
        Number(cardData.expireYear),
        Number(cardData.expireMonth)
      )
    }))
  );

  const cardComponent = pipe(
    paymentCardData,
    O.fold(
      () => <PaymentCardBig testID="CreditCardComponent" isLoading={true} />,
      ({ expDate, holder, brand, abiCode }) => (
        <PaymentCardBig
          cardType="COBADGE"
          expirationDate={expDate}
          holderName={holder}
          cardIcon={brand}
          abiCode={abiCode}
        />
      )
    )
  );
  return (
    <BasePaymentMethodScreen
      paymentMethod={cobadge}
      card={cardComponent}
      content={
        <Banner
          pictogramName="feedback"
          size="big"
          color="neutral"
          viewRef={bannerViewRef}
          title={I18n.t("wallet.methodDetailsWebviewBanner.title")}
          content={I18n.t("wallet.methodDetailsWebviewBanner.content")}
          action={I18n.t("wallet.methodDetailsWebviewBanner.cta")}
          onPress={() =>
            openAuthenticationSession(acceptedPaymentMethodsFaqUrl, "")
          }
        />
      }
    />
  );
};

export default CobadgeDetailScreen;

import * as React from "react";

import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { IOLogoPaymentExtType } from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { PaymentCardBig } from "../../../../components/ui/cards/payment/PaymentCardBig";
import { useIOSelector } from "../../../../store/hooks";
import { creditCardByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { idPayAreInitiativesFromInstrumentLoadingSelector } from "../../../idpay/wallet/store/reducers";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import { capitalize } from "../../../../utils/strings";

export type CreditCardDetailScreenNavigationParams = Readonly<{
  // Since we don't have a typed ID for the payment methods, we keep the creditCard as param even if it is then read by the store
  creditCard: CreditCardPaymentMethod;
}>;

/**
 * Detail screen for a credit card
 */
const CreditCardDetailScreen = () => {
  const [walletExisted, setWalletExisted] = React.useState(false);
  const { creditCard: paramCreditCard } =
    useRoute<
      Route<"WALLET_CREDIT_CARD_DETAIL", CreditCardDetailScreenNavigationParams>
    >().params;
  // We need to read the card from the store to receive the updates
  // TODO: to avoid this we need a store refactoring for the wallet section (all the component should receive the id and not the wallet, in order to update when needed)
  const storeCreditCard = useIOSelector(state =>
    creditCardByIdSelector(state, paramCreditCard.idWallet)
  );
  const areIdpayInitiativesLoading = useIOSelector(
    idPayAreInitiativesFromInstrumentLoadingSelector
  );

  // This will set the flag `walletExisted` to true
  // if, during this component lifecycle, a card actually
  // existed in the state and has been removed. It's used to
  // prevent the show of the `WorkunitGenericFailure`.
  React.useEffect(() => {
    if (storeCreditCard) {
      setWalletExisted(true);
    }
  }, [storeCreditCard, setWalletExisted]);

  if (storeCreditCard !== undefined) {
    const paymentCardData = pipe(
      storeCreditCard,
      ({ info }) =>
        sequenceS(O.Monad)({
          // all or nothing, if one of these is missing we don't show the card
          blurredNumber: O.fromNullable(info.blurredNumber),
          expireMonth: O.fromNullable(info.expireMonth),
          expireYear: O.fromNullable(info.expireYear),
          holder: O.fromNullable(info.holder),
          brand: O.fromNullable(info.brand as IOLogoPaymentExtType | undefined)
          // store gives it as string,
          // is later checked by component and null case is handled
        }),
      O.map(cardData => ({
        ...cardData,
        expDate: new Date(
          Number(cardData.expireYear),
          // month is 0 based, while BE response isn't
          Number(cardData.expireMonth) - 1
        )
      }))
    );

    const cardComponent = pipe(
      paymentCardData,
      O.fold(
        () => <PaymentCardBig testID="CreditCardComponent" isLoading={true} />,
        ({ expDate, holder, blurredNumber, brand }) => (
          <PaymentCardBig
            testID="CreditCardComponent"
            cardType="CREDIT"
            expirationDate={expDate}
            holderName={holder}
            hpan={blurredNumber}
            cardIcon={brand}
          />
        )
      )
    );
    const capitalizedCardCircuit = capitalize(
      storeCreditCard.info.brand?.toLowerCase() ?? ""
    );
    return (
      <LoadingSpinnerOverlay
        isLoading={areIdpayInitiativesLoading}
        loadingOpacity={100}
      >
        <BasePaymentMethodScreen
          paymentMethod={storeCreditCard}
          card={cardComponent}
          content={<PaymentMethodFeatures paymentMethod={storeCreditCard} />}
          headerTitle={`${capitalizedCardCircuit} ••${storeCreditCard.info.blurredNumber}`}
        />
      </LoadingSpinnerOverlay>
    );
  } else if (!walletExisted) {
    return <WorkunitGenericFailure />;
  }
  return null;
};

export default CreditCardDetailScreen;

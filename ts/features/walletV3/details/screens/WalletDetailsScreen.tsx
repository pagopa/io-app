import * as React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { IOLogoPaymentExtType } from "@pagopa/io-app-design-system";

import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { PaymentCardBig } from "../../../../components/ui/cards/payment/PaymentCardBig";
import { useIOSelector } from "../../../../store/hooks";
import { idPayAreInitiativesFromInstrumentLoadingSelector } from "../../../idpay/wallet/store/reducers";
import { capitalize } from "../../../../utils/strings";
import WalletDetailsPaymentMethodScreen from "../components/WalletDetailsPaymentMethodScreen";
import WalletDetailsPaymentMethodFeatures from "../../common/components/WalletDetailsPaymentMethodFeatures";
import { WalletDetailsParamsList } from "../navigation/navigator";
import {
  isErrorWalletInstrumentSelector,
  isLoadingWalletInstrumentSelector,
  walletDetailsInstrumentSelector
} from "../store";
import { walletDetailsGetInstrument } from "../store/actions";
import {
  TypeEnum,
  WalletInfoDetails,
  WalletInfoDetails1,
  WalletInfoDetails2
} from "../../../../../definitions/pagopa/walletv3/WalletInfoDetails";

export type WalletDetailsScreenNavigationParams = Readonly<{
  walletId: string;
}>;

export type WalletDetailsScreenRouteProps = RouteProp<
  WalletDetailsParamsList,
  "WALLET_DETAILS_SCREEN"
>;

const generateCardComponent = (walletDetails: WalletInfoDetails) => {
  switch (walletDetails.type) {
    case TypeEnum.PAYPAL:
      const paypalDetails = walletDetails as WalletInfoDetails2;
      return (
        <PaymentCardBig
          testID="CreditCardComponent"
          cardType="PAYPAL"
          holderEmail={paypalDetails.maskedEmail}
        />
      );
    case TypeEnum.CARDS:
    default:
      const cardDetails = walletDetails as WalletInfoDetails1;
      return (
        <PaymentCardBig
          testID="CreditCardComponent"
          cardType="CREDIT"
          expirationDate={cardDetails.expiryDate}
          holderName={cardDetails.holder}
          hpan={cardDetails.maskedPan}
          cardIcon={cardDetails.brand.toLowerCase() as IOLogoPaymentExtType}
        />
      );
  }
};

const generateCardHeaderTitle = (walletDetails?: WalletInfoDetails) => {
  switch (walletDetails?.type) {
    case TypeEnum.CARDS:
      const cardDetails = walletDetails as WalletInfoDetails1;
      const capitalizedCardCircuit = capitalize(
        cardDetails.brand.toLowerCase() ?? ""
      );
      return `${capitalizedCardCircuit} ••${cardDetails.maskedPan}`;
    default:
      return "";
  }
};

/**
 * Detail screen for a credit card
 */
const WalletDetailsScreen = () => {
  const route = useRoute<WalletDetailsScreenRouteProps>();
  const dispatch = useDispatch();
  const { walletId } = route.params;
  const walletDetails = useIOSelector(walletDetailsInstrumentSelector);
  const isLoadingWalletDetails = useIOSelector(
    isLoadingWalletInstrumentSelector
  );
  const isErrorWalletDetails = useIOSelector(isErrorWalletInstrumentSelector);
  const areIdpayInitiativesLoading = useIOSelector(
    idPayAreInitiativesFromInstrumentLoadingSelector
  );

  React.useEffect(() => {
    dispatch(walletDetailsGetInstrument.request({ walletId }));
  }, [walletId, dispatch]);

  if (isLoadingWalletDetails) {
    return (
      <WalletDetailsPaymentMethodScreen
        paymentMethod={walletDetails}
        card={<PaymentCardBig testID="CreditCardComponent" isLoading={true} />}
        content={<></>}
      />
    );
  }

  if (walletDetails !== undefined) {
    const cardComponent = pipe(
      walletDetails.details,
      O.fromNullable,
      O.fold(
        () => <PaymentCardBig testID="CreditCardComponent" isLoading={true} />,
        details => generateCardComponent(details)
      )
    );

    return (
      <LoadingSpinnerOverlay
        isLoading={areIdpayInitiativesLoading}
        loadingOpacity={100}
      >
        <WalletDetailsPaymentMethodScreen
          paymentMethod={walletDetails}
          card={cardComponent}
          content={
            <WalletDetailsPaymentMethodFeatures paymentMethod={walletDetails} />
          }
          headerTitle={generateCardHeaderTitle(walletDetails.details)}
        />
      </LoadingSpinnerOverlay>
    );
  } else if (isErrorWalletDetails) {
    return <WorkunitGenericFailure />;
  }
  return null;
};

export default WalletDetailsScreen;

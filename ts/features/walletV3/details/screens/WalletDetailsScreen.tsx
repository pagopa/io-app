import * as React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";

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
  isLoadingWalletInstrumentSelector,
  walletDetailsInstrumentSelector
} from "../store";
import { walletDetailsGetInstrument } from "../store/actions";

export type WalletDetailsScreenNavigationParams = Readonly<{
  walletId: string;
}>;

export type WalletDetailsScreenRouteProps = RouteProp<
  WalletDetailsParamsList,
  "WALLET_DETAILS_SCREEN"
>;

/**
 * Detail screen for a credit card
 */
const WalletDetailsScreen = () => {
  const [walletExisted, setWalletExisted] = React.useState(false);
  const route = useRoute<WalletDetailsScreenRouteProps>();
  const dispatch = useDispatch();
  const { walletId } = route.params;
  const walletDetails = useIOSelector(walletDetailsInstrumentSelector);
  const isLoadingWalletDetails = useIOSelector(
    isLoadingWalletInstrumentSelector
  );
  const areIdpayInitiativesLoading = useIOSelector(
    idPayAreInitiativesFromInstrumentLoadingSelector
  );

  // This will set the flag `walletExisted` to true
  // if, during this component lifecycle, a card actually
  // existed in the state and has been removed. It's used to
  // prevent the show of the `WorkunitGenericFailure`.
  // React.useEffect(() => {
  //   if (storeCreditCard) {
  //     setWalletExisted(true);
  //   }
  // }, [storeCreditCard, setWalletExisted]);

  React.useEffect(() => {
    dispatch(walletDetailsGetInstrument.request({ walletId }));
  }, [walletId, dispatch]);

  if (isLoadingWalletDetails) {
    return <>{/* TODO: RENDER SKELETON PAGE */}</>;
  }

  if (walletDetails !== undefined) {
    const cardComponent = pipe(
      walletDetails.details,
      O.fromNullable,
      O.fold(
        () => <PaymentCardBig testID="CreditCardComponent" isLoading={true} />,
        ({ type, expiryDate, holder, maskedPan, brand }) => (
          <PaymentCardBig
            testID="CreditCardComponent"
            cardType={type}
            expirationDate={expiryDate}
            holderName={holder}
            hpan={maskedPan}
            cardIcon={brand}
          />
        )
      )
    );
    const capitalizedCardCircuit = capitalize(
      walletDetails.details?.brand?.toLowerCase() ?? ""
    );
    const headerTitle =
      walletDetails.details.type === "CARD"
        ? `${capitalizedCardCircuit} ••${walletDetails.details.maskedPan}`
        : "TITLE";
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
          headerTitle={headerTitle}
        />
      </LoadingSpinnerOverlay>
    );
  } else if (!walletExisted) {
    return <WorkunitGenericFailure />;
  }
  return null;
};

export default WalletDetailsScreen;

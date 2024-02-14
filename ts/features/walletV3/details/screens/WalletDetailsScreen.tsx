import * as React from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { IOLogoPaymentExtType } from "@pagopa/io-app-design-system";

import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
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
import { UIWalletInfoDetails } from "../types/UIWalletInfoDetails";
import { getDateFromExpiryDate } from "../../../../utils/dates";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

export type WalletDetailsScreenNavigationParams = Readonly<{
  walletId: string;
}>;

export type WalletDetailsScreenRouteProps = RouteProp<
  WalletDetailsParamsList,
  "WALLET_DETAILS_SCREEN"
>;

const generateCardComponent = (details: UIWalletInfoDetails) => {
  if (details.maskedEmail !== undefined) {
    return (
      <PaymentCardBig
        testID="CreditCardComponent"
        cardType="PAYPAL"
        holderEmail={details.maskedEmail}
      />
    );
  }

  return (
    <PaymentCardBig
      testID="CreditCardComponent"
      cardType="CREDIT"
      expirationDate={getDateFromExpiryDate(details.expiryDate)}
      holderName={details.holder || ""}
      hpan={details.maskedPan || ""}
      cardIcon={details.brand?.toLowerCase() as IOLogoPaymentExtType}
    />
  );
};

const generateCardHeaderTitle = (details?: UIWalletInfoDetails) => {
  if (details?.maskedPan !== undefined) {
    const capitalizedCardCircuit = capitalize(
      details.brand?.toLowerCase() ?? ""
    );
    return `${capitalizedCardCircuit} ••${details.maskedPan}`;
  }

  return "";
};

/**
 * Detail screen for a credit card
 */
const WalletDetailsScreen = () => {
  const route = useRoute<WalletDetailsScreenRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
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

  const WalletDetailsGenericFailure = () => (
    <OperationResultScreenContent
      title={I18n.t("wallet.methodDetails.error.title")}
      subtitle={I18n.t("wallet.methodDetails.error.subtitle")}
      pictogram="umbrellaNew"
      action={{
        label: I18n.t("wallet.methodDetails.error.primaryButton"),
        accessibilityLabel: I18n.t("wallet.methodDetails.error.primaryButton"),
        onPress: () => navigation.pop()
      }}
      secondaryAction={{
        label: I18n.t("wallet.methodDetails.error.secondaryButton"),
        accessibilityLabel: I18n.t(
          "wallet.methodDetails.error.secondaryButton"
        ),
        onPress: handleOnRetry
      }}
    />
  );

  const handleOnRetry = () => {
    dispatch(walletDetailsGetInstrument.request({ walletId }));
  };

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
    return <WalletDetailsGenericFailure />;
  }
  return null;
};

export default WalletDetailsScreen;

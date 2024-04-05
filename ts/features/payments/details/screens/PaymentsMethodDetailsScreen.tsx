import { IOLogoPaymentExtType } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useDispatch } from "react-redux";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { getDateFromExpiryDate } from "../../../../utils/dates";
import { capitalize } from "../../../../utils/strings";
import { idPayAreInitiativesFromInstrumentLoadingSelector } from "../../../idpay/wallet/store/reducers";
import { PaymentCardBig } from "../../common/components/PaymentCardBig";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import WalletDetailsPaymentMethodFeatures from "../components/WalletDetailsPaymentMethodFeatures";
import WalletDetailsPaymentMethodScreen from "../components/WalletDetailsPaymentMethodScreen";
import { PaymentsMethodDetailsParamsList } from "../navigation/params";
import { paymentsGetMethodDetailsAction } from "../store/actions";
import { selectPaymentMethodDetails } from "../store/selectors";

export type PaymentsMethodDetailsScreenNavigationParams = Readonly<{
  walletId: string;
}>;

export type PaymentsMethodDetailsScreenRouteProps = RouteProp<
  PaymentsMethodDetailsParamsList,
  "PAYMENT_METHOD_DETAILS_SCREEN"
>;

const generateCardComponent = (details: UIWalletInfoDetails) => {
  // TODO: IOBP-559
  // This part is still type-dependant. We should refactor the component to allow
  // unconditional rendering of every info of the card

  if (details.maskedEmail !== undefined) {
    return (
      <PaymentCardBig
        testID="CreditCardComponent"
        cardType="PAYPAL"
        holderEmail={details.maskedEmail}
      />
    );
  }

  if (details.maskedNumber !== undefined) {
    return (
      <PaymentCardBig
        testID="CreditCardComponent"
        cardType="BANCOMATPAY"
        holderName={""}
        phoneNumber={details.maskedNumber}
      />
    );
  }

  return (
    <PaymentCardBig
      testID="CreditCardComponent"
      cardType="CREDIT"
      expirationDate={getDateFromExpiryDate(details.expiryDate)}
      holderName={""}
      hpan={details.lastFourDigits || ""}
      cardIcon={details.brand?.toLowerCase() as IOLogoPaymentExtType}
    />
  );
};

const generateCardHeaderTitle = (details?: UIWalletInfoDetails) => {
  if (details?.lastFourDigits !== undefined) {
    const capitalizedCardCircuit = capitalize(
      details.brand?.toLowerCase() ?? ""
    );
    return `${capitalizedCardCircuit} ••${details.lastFourDigits}`;
  }

  return "";
};

/**
 * Detail screen for a credit card
 */
const PaymentsMethodDetailsScreen = () => {
  const route = useRoute<PaymentsMethodDetailsScreenRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useDispatch();
  const { walletId } = route.params;
  const walletDetailsPot = useIOSelector(selectPaymentMethodDetails);

  const isLoadingWalletDetails = pot.isLoading(walletDetailsPot);
  const isErrorWalletDetails = pot.isError(walletDetailsPot);

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
    dispatch(paymentsGetMethodDetailsAction.request({ walletId }));
  };

  React.useEffect(() => {
    dispatch(paymentsGetMethodDetailsAction.request({ walletId }));
  }, [walletId, dispatch]);

  if (isLoadingWalletDetails) {
    return (
      <WalletDetailsPaymentMethodScreen
        paymentMethod={pot.toUndefined(walletDetailsPot)}
        card={<PaymentCardBig testID="CreditCardComponent" isLoading={true} />}
        content={<></>}
      />
    );
  }

  if (pot.isSome(walletDetailsPot)) {
    const cardComponent = pipe(
      walletDetailsPot.value.details,
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
          paymentMethod={walletDetailsPot.value}
          card={cardComponent}
          content={
            <WalletDetailsPaymentMethodFeatures
              paymentMethod={walletDetailsPot.value}
            />
          }
          headerTitle={generateCardHeaderTitle(walletDetailsPot.value.details)}
        />
      </LoadingSpinnerOverlay>
    );
  } else if (isErrorWalletDetails) {
    return <WalletDetailsGenericFailure />;
  }
  return null;
};

export default PaymentsMethodDetailsScreen;

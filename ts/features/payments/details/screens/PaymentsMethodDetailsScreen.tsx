import { VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as React from "react";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus";
import { getDateFromExpiryDate } from "../../../../utils/dates";
import { capitalize } from "../../../../utils/strings";
import { idPayInitiativesFromInstrumentGet } from "../../../idpay/wallet/store/actions";
import { idPayAreInitiativesFromInstrumentLoadingSelector } from "../../../idpay/wallet/store/reducers";
import { PaymentCardProps } from "../../common/components/PaymentCard";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { PaymentsMethodDetailsBaseScreenComponent } from "../components/PaymentsMethodDetailsBaseScreenComponent";
import { PaymentsMethodDetailsDeleteButton } from "../components/PaymentsMethodDetailsDeleteButton";
import { PaymentsMethodDetailsErrorContent } from "../components/PaymentsMethodDetailsErrorContent";
import WalletDetailsPaymentMethodFeatures from "../components/WalletDetailsPaymentMethodFeatures";
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

const PaymentsMethodDetailsScreen = () => {
  const route = useRoute<PaymentsMethodDetailsScreenRouteProps>();
  const dispatch = useIODispatch();

  const { walletId } = route.params;

  const isIdpayEnabled = useIOSelector(isIdPayEnabledSelector);
  const walletDetailsPot = useIOSelector(selectPaymentMethodDetails);
  const areIdpayInitiativesLoading = useIOSelector(
    idPayAreInitiativesFromInstrumentLoadingSelector
  );

  const isLoading =
    pot.isLoading(walletDetailsPot) ||
    pot.isUpdating(walletDetailsPot) ||
    areIdpayInitiativesLoading;

  React.useEffect(() => {
    dispatch(paymentsGetMethodDetailsAction.request({ walletId }));
    if (isIdpayEnabled) {
      dispatch(
        idPayInitiativesFromInstrumentGet.request({
          idWallet: walletId
        })
      );
    }
  }, [walletId, dispatch, isIdpayEnabled]);

  if (isLoading) {
    return (
      <PaymentsMethodDetailsBaseScreenComponent
        card={{ testID: "CreditCardComponent", isLoading: true }}
      />
    );
  }

  if (pot.isSome(walletDetailsPot) && !isLoading) {
    const paymentMethod = walletDetailsPot.value;
    const cardProps = getPaymentCardPropsFromWallet(paymentMethod);
    const headerTitle = getCardHeaderTitle(paymentMethod.details);

    return (
      <PaymentsMethodDetailsBaseScreenComponent
        card={cardProps}
        headerTitle={headerTitle}
      >
        <WalletDetailsPaymentMethodFeatures paymentMethod={paymentMethod} />
        <VSpacer size={24} />
        <PaymentsMethodDetailsDeleteButton paymentMethod={paymentMethod} />
      </PaymentsMethodDetailsBaseScreenComponent>
    );
  }

  return <PaymentsMethodDetailsErrorContent walletId={walletId} />;
};

const getCardHeaderTitle = (details?: UIWalletInfoDetails) => {
  if (details?.lastFourDigits !== undefined) {
    const capitalizedCardCircuit = capitalize(
      details.brand?.toLowerCase() ?? ""
    );
    return `${capitalizedCardCircuit} ••${details.lastFourDigits}`;
  }

  return "";
};

const getPaymentCardPropsFromWallet = (
  wallet: WalletInfo
): PaymentCardProps => {
  const details = wallet.details as UIWalletInfoDetails;

  return {
    hpan: details.lastFourDigits,
    abiCode: details.abi,
    brand: details.brand,
    expireDate: getDateFromExpiryDate(details.expiryDate),
    holderEmail: details.maskedEmail,
    holderPhone: details.maskedNumber
  };
};

export default PaymentsMethodDetailsScreen;

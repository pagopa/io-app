import { VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { capitalize } from "../../../../utils/strings";
import { idPayInitiativesFromInstrumentGet } from "../../../idpay/wallet/store/actions";
import { idPayAreInitiativesFromInstrumentLoadingSelector } from "../../../idpay/wallet/store/reducers";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { getPaymentCardPropsFromWalletInfo } from "../../common/utils";
import { PaymentsMethodDetailsBaseScreenComponent } from "../components/PaymentsMethodDetailsBaseScreenComponent";
import { PaymentsMethodDetailsDeleteButton } from "../components/PaymentsMethodDetailsDeleteButton";
import { PaymentsMethodDetailsErrorContent } from "../components/PaymentsMethodDetailsErrorContent";
import { PaymentsMethodDetailsUpdateDataButton } from "../components/PaymentsMethodDetailsUpdateDataButton";
import { PaymentsMethodPspDetailsAlert } from "../components/PaymentsMethodPspDetailsAlert";
import WalletDetailsPaymentMethodFeatures from "../components/WalletDetailsPaymentMethodFeatures";
import { PaymentsMethodDetailsParamsList } from "../navigation/params";
import { paymentsGetMethodDetailsAction } from "../store/actions";
import { selectPaymentMethodDetails } from "../store/selectors";

export type PaymentsMethodDetailsScreenNavigationParams = Readonly<{
  walletId: string;
}>;

type PaymentsMethodDetailsScreenRouteProps = RouteProp<
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

  useEffect(() => {
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
    const cardProps = getPaymentCardPropsFromWalletInfo(paymentMethod);
    const headerTitle = getCardHeaderTitle(paymentMethod.details);
    const paymentMethodDetails = paymentMethod.details as UIWalletInfoDetails;

    return (
      <>
        <PaymentsMethodDetailsBaseScreenComponent
          card={{ ...cardProps, isExpired: false }}
          headerTitle={headerTitle}
        >
          {paymentMethodDetails.pspBusinessName && (
            <PaymentsMethodPspDetailsAlert
              pspBusinessName={paymentMethodDetails.pspBusinessName}
            />
          )}
          <WalletDetailsPaymentMethodFeatures paymentMethod={paymentMethod} />
          <VSpacer size={24} />
          <PaymentsMethodDetailsDeleteButton paymentMethod={paymentMethod} />
        </PaymentsMethodDetailsBaseScreenComponent>
        <PaymentsMethodDetailsUpdateDataButton paymentMethod={paymentMethod} />
      </>
    );
  }

  return <PaymentsMethodDetailsErrorContent walletId={walletId} />;
};

const getCardHeaderTitle = (details?: UIWalletInfoDetails) => {
  switch (details?.type) {
    case "BPAY":
      return "BANCOMAT Pay";
    case "PAYPAL":
      return "PayPal";
    default:
      if (details?.lastFourDigits !== undefined) {
        const capitalizedCardCircuit = capitalize(
          details.brand?.toLowerCase() ?? ""
        );
        return `${capitalizedCardCircuit} ••${details.lastFourDigits}`;
      }
      return "";
  }
};

export default PaymentsMethodDetailsScreen;

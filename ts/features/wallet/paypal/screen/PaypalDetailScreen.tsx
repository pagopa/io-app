import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { useIOSelector } from "../../../../store/hooks";
import { paypalSelector } from "../../../../store/reducers/wallet/wallets";
import { getPaypalAccountEmail } from "../../../../utils/paypal";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import {
  PaymentCardBig,
  PaymentCardBigProps
} from "../../../payments/common/components/PaymentCardBig";

/**
 * Detail screen for a PayPal payment method
 * @constructor
 */
const PaypalDetailScreen = () => {
  const [walletExisted, setWalletExisted] = React.useState(false);
  const paypalSelectorVal = useIOSelector(paypalSelector);
  const paypal = pot.toUndefined(paypalSelectorVal);
  const propsData = pipe(
    paypalSelectorVal,
    pot.toOption,
    O.fold(
      (): PaymentCardBigProps => ({
        isLoading: true
      }),
      (paypal): PaymentCardBigProps => ({
        cardType: "PAYPAL",
        holderEmail: getPaypalAccountEmail(paypal.info)
      })
    )
  );
  // This will set the flag `walletExisted` to true
  // if, during this component lifecycle, the PayPal wallet actually
  // existed in the state and has been removed. It's used to
  // prevent the show of the `WorkunitGenericFailure`.
  React.useEffect(() => {
    if (paypal) {
      setWalletExisted(true);
    }
  }, [paypal, setWalletExisted]);

  return paypal ? (
    <BasePaymentMethodScreen
      paymentMethod={paypal}
      card={<PaymentCardBig {...propsData} />}
      content={<PaymentMethodFeatures paymentMethod={paypal} />}
      headerTitle="PayPal"
    />
  ) : !walletExisted ? (
    <WorkunitGenericFailure />
  ) : null;
};

export default PaypalDetailScreen;

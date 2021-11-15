import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { PayPalPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import PaypalCard from "../PaypalCard";

type NavigationParams = Readonly<{
  paypal: PayPalPaymentMethod;
}>;

type Props = NavigationInjectedProps<NavigationParams>;

/**
 * Detail screen for a paypal payment method
 * @constructor
 */
const PaypalDetailScreen: React.FunctionComponent<Props> = props => {
  const paypal: PayPalPaymentMethod = props.navigation.getParam("paypal");
  return (
    <BasePaymentMethodScreen
      paymentMethod={paypal}
      card={
        <PaypalCard email={paypal.info.emailPp} idWallet={paypal.idWallet} />
      }
      content={<PaymentMethodFeatures paymentMethod={paypal} />}
    />
  );
};

export default PaypalDetailScreen;

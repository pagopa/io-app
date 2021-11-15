import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { PayPalPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import { PaypalCard } from "../PaypalCard";

type NavigationParams = Readonly<{
  paypal: PayPalPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

/**
 * Detail screen for a paypal payment method
 * @constructor
 */
const PaypalDetailScreen: React.FunctionComponent<Props> = props => {
  const paypal: PayPalPaymentMethod = props.navigation.getParam("paypal");
  console.log("QUI1", paypal);
  return (
    <BasePaymentMethodScreen
      paymentMethod={paypal}
      card={<PaypalCard email={paypal.info.emailPp} />}
      content={<PaymentMethodFeatures paymentMethod={paypal} />}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PaypalDetailScreen);

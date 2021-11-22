import * as React from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import PaypalCard from "../PaypalCard";
import { GlobalState } from "../../../../store/reducers/types";
import { PayPalPaymentMethod } from "../../../../types/pagopa";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { paypalSelector } from "../../../../store/reducers/wallet/wallets";

type NavigationParams = Readonly<{
  paypal: PayPalPaymentMethod;
}>;

type Props = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapStateToProps>;

/**
 * Detail screen for a paypal payment method
 * @constructor
 */
const PaypalDetailScreen: React.FunctionComponent<Props> = props => {
  const paypal = pot.toUndefined(props.paymentMethod);
  // it should not never happen since this screen is shown from a navigation that starts from a paypal payment method
  if (paypal === undefined) {
    return <WorkunitGenericFailure />;
  }
  return (
    <BasePaymentMethodScreen
      paymentMethod={paypal}
      card={<PaypalCard paypal={paypal} />}
      content={<PaymentMethodFeatures paymentMethod={paypal} />}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  paymentMethod: paypalSelector(state)
});

export default connect(mapStateToProps)(PaypalDetailScreen);

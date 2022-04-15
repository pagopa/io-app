import * as React from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { connect } from "react-redux";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import PaypalCard from "../PaypalCard";
import { GlobalState } from "../../../../store/reducers/types";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { paypalSelector } from "../../../../store/reducers/wallet/wallets";

type Props = ReturnType<typeof mapStateToProps>;

/**
 * Detail screen for a PayPal payment method
 * @constructor
 */
const PaypalDetailScreen: React.FunctionComponent<Props> = props => {
  const paypal = pot.toUndefined(props.paymentMethod);
  // this should never happen since this screen is shown from a navigation that starts from a PayPal payment method
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

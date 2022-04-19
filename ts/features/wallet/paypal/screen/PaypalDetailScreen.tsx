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
  const [walletExisted, setWalletExisted] = React.useState(false);
  const paypal = pot.toUndefined(props.paymentMethod);

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
      card={<PaypalCard paypal={paypal} />}
      content={<PaymentMethodFeatures paymentMethod={paypal} />}
    />
  ) : !walletExisted ? (
    <WorkunitGenericFailure />
  ) : null;
};

const mapStateToProps = (state: GlobalState) => ({
  paymentMethod: paypalSelector(state)
});

export default connect(mapStateToProps)(PaypalDetailScreen);

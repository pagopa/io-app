import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import PaypalCard from "../PaypalCard";
import { GlobalState } from "../../../../store/reducers/types";
import { payPalByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { PayPalPaymentMethod } from "../../../../types/pagopa";

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
  const paypal = props.navigation.getParam("paypal");
  return (
    <BasePaymentMethodScreen
      paymentMethod={paypal}
      card={<PaypalCard paypal={paypal} />}
      content={<PaymentMethodFeatures paymentMethod={paypal} />}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  paymentMethod: (idWallet: number) => payPalByIdSelector(state, idWallet)
});

export default connect(mapStateToProps)(PaypalDetailScreen);

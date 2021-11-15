import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import PaypalCard from "../PaypalCard";
import { GlobalState } from "../../../../store/reducers/types";
import { payPalByIdSelector } from "../../../../store/reducers/wallet/wallets";

type NavigationParams = Readonly<{
  idWallet: number;
}>;

type Props = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapStateToProps>;

/**
 * Detail screen for a paypal payment method
 * @constructor
 */
const PaypalDetailScreen: React.FunctionComponent<Props> = props => {
  const paypal = props.paymentMethod(props.navigation.getParam("idWallet"));
  // it should not never happen since this screen is shown from a navigation that starts from a paypal payment method
  if (paypal === undefined) {
    return null;
  }
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

const mapStateToProps = (state: GlobalState) => ({
  paymentMethod: (idWallet: number) => payPalByIdSelector(state, idWallet)
});

export default connect(mapStateToProps)(PaypalDetailScreen);

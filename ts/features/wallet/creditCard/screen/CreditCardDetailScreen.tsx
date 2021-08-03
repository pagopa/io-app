import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import CreditCardComponent from "../component/CreditCardComponent";

type NavigationParams = Readonly<{
  creditCard: CreditCardPaymentMethod;
}>;

type Props = NavigationInjectedProps<NavigationParams>;

/**
 * Detail screen for a credit card
 * @constructor
 */
export const CreditCardDetailScreen: React.FunctionComponent<Props> = props => {
  const creditCard: CreditCardPaymentMethod = props.navigation.getParam(
    "creditCard"
  );

  return (
    <BasePaymentMethodScreen
      paymentMethod={creditCard}
      card={<CreditCardComponent creditCard={creditCard} />}
      content={<PaymentMethodFeatures paymentMethod={creditCard} />}
    />
  );
};

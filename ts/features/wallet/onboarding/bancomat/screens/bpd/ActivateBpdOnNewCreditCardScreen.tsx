import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { CreditCardPaymentMethod } from "../../../../../../types/pagopa";
import ActivateBpdOnNewPaymentMethodScreen from "./ActivateBpdOnNewPaymentMethodScreen";

type ActivateBpdOnNewCreditCardScreenNavigationParams = {
  creditCards: ReadonlyArray<CreditCardPaymentMethod>;
};
type Props = NavigationScreenProps<
  ActivateBpdOnNewCreditCardScreenNavigationParams
>;

export const ActivateBpdOnNewCreditCardScreen: React.FC<Props> = (
  props: Props
) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.navigation.getParam("creditCards")}
  />
);

import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { EnhancedPaymentMethod } from "../../../../../../store/reducers/wallet/wallets";
import ActivateBpdOnNewPaymentMethodScreen from "./ActivateBpdOnNewPaymentMethodScreen";

type ActivateBpdOnNewCreditCardScreenNavigationParams = {
  creditCards: ReadonlyArray<EnhancedPaymentMethod>;
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

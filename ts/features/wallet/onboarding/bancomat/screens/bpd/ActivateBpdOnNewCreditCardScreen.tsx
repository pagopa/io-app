import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { PatchedWalletV2 } from "../../../../../../types/pagopa";
import ActivateBpdOnNewPaymentMethodScreen from "./ActivateBpdOnNewPaymentMethodScreen";

type ActivateBpdOnNewCreditCardScreenNavigationParams = {
  creditCards: ReadonlyArray<PatchedWalletV2>;
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

import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import I18n from "../../../../../../i18n";
import { PaymentMethod } from "../../../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import ActivateBpdOnNewPaymentMethodScreen from "./ActivateBpdOnNewPaymentMethodScreen";

type ActivateBpdOnNewCreditCardScreenNavigationParams = {
  creditCards: ReadonlyArray<PaymentMethod>;
};
type Props = NavigationScreenProps<
  ActivateBpdOnNewCreditCardScreenNavigationParams
>;

export const ActivateBpdOnNewCreditCardScreen: React.FC<Props> = (
  props: Props
) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.navigation.getParam("creditCards")}
    title={I18n.t("bonus.bpd.title")}
    contextualHelp={emptyContextualHelp}
  />
);

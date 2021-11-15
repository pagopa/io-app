import * as React from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import I18n from "../../../../../../i18n";
import { PaymentMethod } from "../../../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import ActivateBpdOnNewPaymentMethodScreen from "./ActivateBpdOnNewPaymentMethodScreen";

type ActivateBpdOnNewCreditCardScreenNavigationParams = {
  creditCards: ReadonlyArray<PaymentMethod>;
};
type Props =
  NavigationStackScreenProps<ActivateBpdOnNewCreditCardScreenNavigationParams>;

export const ActivateBpdOnNewCreditCardScreen: React.FC<Props> = (
  props: Props
) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.navigation.getParam("creditCards")}
    title={I18n.t("bonus.bpd.title")}
    contextualHelp={emptyContextualHelp}
  />
);

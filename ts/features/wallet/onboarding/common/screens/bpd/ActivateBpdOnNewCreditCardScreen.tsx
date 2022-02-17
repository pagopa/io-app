import * as React from "react";
import I18n from "../../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../../../navigation/params/WalletParamsList";
import { PaymentMethod } from "../../../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import ActivateBpdOnNewPaymentMethodScreen from "./ActivateBpdOnNewPaymentMethodScreen";

export type ActivateBpdOnNewCreditCardScreenNavigationParams = {
  creditCards: ReadonlyArray<PaymentMethod>;
};
type Props = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_ONBOARDING_CREDIT_CARD_ACTIVATE_BPD_NEW"
>;

export const ActivateBpdOnNewCreditCardScreen: React.FC<Props> = (
  props: Props
) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.route.params.creditCards}
    title={I18n.t("bonus.bpd.title")}
    contextualHelp={emptyContextualHelp}
  />
);

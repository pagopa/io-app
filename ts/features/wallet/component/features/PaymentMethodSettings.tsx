import * as React from "react";
import { H6, IOSpacingScale } from "@pagopa/io-app-design-system";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import FavoritePaymentMethodSwitch from "../../../../components/wallet/FavoriteMethodSwitch";
import I18n from "../../../../i18n";
import { PaymentMethod } from "../../../../types/pagopa";
import { isEnabledToPay } from "../../../../utils/paymentMethodCapabilities";
import PagoPaPaymentCapability from "./PagoPaPaymentCapability";

type Props = { paymentMethod: PaymentMethod };

const componentVerticalSpacing: IOSpacingScale = 12;

/**
 * This component allows the user to choose and change the common settings for a payment methods
 * The {@link FavoritePaymentMethodSwitch} should be rendered only if the payment method has the capability pagoPA and
 * the payment are active (paymentMethod.pagoPA === true)
 * @param props
 * @constructor
 */
const PaymentMethodSettings = (props: Props): React.ReactElement => (
  <>
    <H6
      color={"grey-700"}
      style={{ paddingVertical: componentVerticalSpacing }}
    >
      {I18n.t("global.buttons.settings")}
    </H6>
    <PagoPaPaymentCapability paymentMethod={props.paymentMethod} />
    <ItemSeparatorComponent noPadded={true} />
    {isEnabledToPay(props.paymentMethod) && (
      <FavoritePaymentMethodSwitch paymentMethod={props.paymentMethod} />
    )}
  </>
);

export default PaymentMethodSettings;

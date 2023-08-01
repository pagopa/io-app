import * as React from "react";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { H3 } from "../../../../components/core/typography/H3";
import { IOSpacingScale } from "../../../../components/core/variables/IOSpacing";
import FavoritePaymentMethodSwitch from "../../../../components/wallet/FavoriteMethodSwitch";
import I18n from "../../../../i18n";
import { PaymentMethod } from "../../../../types/pagopa";
import { isEnabledToPay } from "../../../../utils/paymentMethodCapabilities";
import PagoPaPaymentCapability from "./PagoPaPaymentCapability";

type Props = { paymentMethod: PaymentMethod };

/**
 * This component allows the user to choose and change the common settings for a payment methods
 * The {@link FavoritePaymentMethodSwitch} should be rendered only if the payment method has the capability pagoPA and
 * the payment are active (paymentMethod.pagoPA === true)
 * @param props
 * @constructor
 */
const PaymentMethodSettings = (props: Props): React.ReactElement => (
  <>
    <H3
      color={"bluegrey"}
      style={{ paddingVertical: IOSpacingScale[3] /* 12 */ }}
    >
      {I18n.t("global.buttons.settings")}
    </H3>
    <PagoPaPaymentCapability paymentMethod={props.paymentMethod} />
    <ItemSeparatorComponent noPadded={true} />
    {isEnabledToPay(props.paymentMethod) && (
      <FavoritePaymentMethodSwitch paymentMethod={props.paymentMethod} />
    )}
  </>
);

export default PaymentMethodSettings;

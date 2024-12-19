import { Divider, ListItemHeader } from "@pagopa/io-app-design-system";
import * as React from "react";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import I18n from "../../../../i18n";
import WalletDetailsPagoPaPaymentCapability from "./WalletDetailsPagoPaPaymentCapability";

type Props = { paymentMethod: WalletInfo };

/**
 * This component allows the user to choose and change the common settings for a payment methods
 * @param props
 * @constructor
 */
const WalletDetailsPaymentMethodSettings = (
  props: Props
): React.ReactElement => (
  <>
    <ListItemHeader label={I18n.t("global.buttons.settings")} />
    <WalletDetailsPagoPaPaymentCapability paymentMethod={props.paymentMethod} />
    <Divider />
  </>
);

export default WalletDetailsPaymentMethodSettings;

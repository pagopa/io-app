import { Divider, ListItemHeader } from "@pagopa/io-app-design-system";

import { ReactElement } from "react";
import I18n from "i18next";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import WalletDetailsPagoPaPaymentCapability from "./WalletDetailsPagoPaPaymentCapability";

type Props = { paymentMethod: WalletInfo };

/**
 * This component allows the user to choose and change the common settings for a payment methods
 * @param props
 * @constructor
 */
const WalletDetailsPaymentMethodSettings = (props: Props): ReactElement => (
  <>
    <ListItemHeader label={I18n.t("global.buttons.settings")} />
    <WalletDetailsPagoPaPaymentCapability paymentMethod={props.paymentMethod} />
    <Divider />
  </>
);

export default WalletDetailsPaymentMethodSettings;

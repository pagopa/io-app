import * as React from "react";
import pagoBancomatImage from "../../../../../../img/wallet/cards-icons/pagobancomat.png";
import {
  EnableableFunctionsTypeEnum,
  PatchedWalletV2
} from "../../../../../types/pagopa";
import { HPan } from "../../store/actions/paymentMethods";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import I18n from "../../../../../i18n";
import PaymentMethodBpdToggle from "./base/PaymentMethodBpdToggle";

type Props = {
  card: PatchedWalletV2;
};

/**
 * Customize a {@link PaymentMethodBpdToggle} with the data from a Bancomat
 * @param props
 * @constructor
 */
export const BancomatBpdToggle: React.FunctionComponent<Props> = props => (
  <PaymentMethodBpdToggle
    hPan={props.card.info.hashPan as HPan}
    icon={pagoBancomatImage}
    hasBpdCapability={hasFunctionEnabled(
      props.card,
      EnableableFunctionsTypeEnum.BPD
    )}
    // TODO: load bank name and displayhere
    caption={I18n.t("wallet.methods.bancomat.name")}
  />
);

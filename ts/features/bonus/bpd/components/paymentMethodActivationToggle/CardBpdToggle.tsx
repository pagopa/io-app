import * as React from "react";
import { getCardIconFromBrandLogo } from "../../../../../components/wallet/card/Logo";
import {
  EnableableFunctionsTypeEnum,
  PatchedWalletV2
} from "../../../../../types/pagopa";
import { HPan } from "../../store/actions/paymentMethods";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import PaymentMethodBpdToggle from "./base/PaymentMethodBpdToggle";

type Props = {
  card: PatchedWalletV2;
};

const FOUR_UNICODE_CIRCLES = "●".repeat(4);

/**
 * Customize a {@link PaymentMethodBpdToggle} with the data from a Credit Card
 * @param props
 * @constructor
 */
export const CardBpdToggle: React.FunctionComponent<Props> = props => (
  <PaymentMethodBpdToggle
    hPan={props.card.info.hashPan as HPan}
    icon={getCardIconFromBrandLogo(props.card.info)}
    hasBpdCapability={hasFunctionEnabled(
      props.card,
      EnableableFunctionsTypeEnum.BPD
    )}
    caption={`${FOUR_UNICODE_CIRCLES} ${props.card.info.blurredNumber}`}
  />
);

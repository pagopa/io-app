import * as React from "react";
import { getCardIconFromBrandLogo } from "../../../../../components/wallet/card/Logo";
import { getPaymentMethodHash } from "../../../../../store/reducers/wallet/wallets";
import {
  CreditCardPaymentMethod,
  EnableableFunctionsTypeEnum
} from "../../../../../types/pagopa";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import { HPan } from "../../store/actions/paymentMethods";
import PaymentMethodBpdToggle from "./base/PaymentMethodBpdToggle";

type Props = {
  card: CreditCardPaymentMethod;
};

const FOUR_UNICODE_CIRCLES = "●".repeat(4);

/**
 * Customize a {@link PaymentMethodBpdToggle} with the data from a Credit Card
 * @param props
 * @constructor
 */
export const CardBpdToggle: React.FunctionComponent<Props> = props => (
  <PaymentMethodBpdToggle
    hPan={getPaymentMethodHash(props.card) as HPan}
    icon={getCardIconFromBrandLogo(props.card)}
    hasBpdCapability={hasFunctionEnabled(
      props.card,
      EnableableFunctionsTypeEnum.BPD
    )}
    caption={`${FOUR_UNICODE_CIRCLES} ${props.card.creditCard.blurredNumber}`}
  />
);

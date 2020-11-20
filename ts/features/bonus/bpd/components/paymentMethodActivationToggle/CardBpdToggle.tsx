import * as React from "react";
import { getCardIconFromBrandLogo } from "../../../../../components/wallet/card/Logo";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  EnableableFunctionsTypeEnum,
  isCreditCard
} from "../../../../../types/pagopa";
import { HPan } from "../../store/actions/paymentMethods";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import { getPaymentMethodHash } from "../../../../../store/reducers/wallet/wallets";
import PaymentMethodBpdToggle from "./base/PaymentMethodBpdToggle";

type Props = {
  card: CreditCardPaymentMethod | BancomatPaymentMethod;
};

const FOUR_UNICODE_CIRCLES = "●".repeat(4);

/**
 * Customize a {@link PaymentMethodBpdToggle} with the data from a Credit Card
 * @param props
 * @constructor
 */
export const CardBpdToggle: React.FunctionComponent<Props> = props => {
  const card = isCreditCard(props.card)
    ? props.card.info.creditCard
    : props.card.info.bancomat;
  return (
    <PaymentMethodBpdToggle
      hPan={getPaymentMethodHash(props.card.info) as HPan}
      icon={getCardIconFromBrandLogo(card)}
      hasBpdCapability={hasFunctionEnabled(
        props.card,
        EnableableFunctionsTypeEnum.BPD
      )}
      caption={`${FOUR_UNICODE_CIRCLES} ${card.blurredNumber ?? ""}`}
    />
  );
};

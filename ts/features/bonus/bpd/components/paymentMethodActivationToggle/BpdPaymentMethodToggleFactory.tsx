import * as React from "react";
import { getPaymentMethodHash } from "../../../../../store/reducers/wallet/wallets";
import {
  isBancomat,
  isCreditCard,
  PaymentMethod
} from "../../../../../types/pagopa";
import BancomatBpdToggle from "./BancomatBpdToggle";
import { CardBpdToggle } from "./CardBpdToggle";

/**
 * Return a specific toggle based on the WalletTypeEnum
 * @param wallet
 */
export const bpdToggleFactory = (paymentMethod: PaymentMethod) => {
  if (isCreditCard(paymentMethod)) {
    return (
      <CardBpdToggle
        key={getPaymentMethodHash(paymentMethod.info)}
        card={paymentMethod}
      />
    );
  }
  if (isBancomat(paymentMethod)) {
    return (
      <BancomatBpdToggle
        key={getPaymentMethodHash(paymentMethod.info)}
        card={paymentMethod}
      />
    );
  }
  return null;
};

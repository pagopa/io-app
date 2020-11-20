import * as React from "react";
import { getPaymentMethodHash } from "../../../../../store/reducers/wallet/wallets";
import {
  isBancomat,
  isCreditCard,
  PaymentMethod
} from "../../../../../types/pagopa";
import { CardBpdToggle } from "./CardBpdToggle";

/**
 * Return a specific toggle based on the WalletTypeEnum
 * @param wallet
 */
export const bpdToggleFactory = (paymentMethod: PaymentMethod) => {
  if (isCreditCard(paymentMethod) || isBancomat(paymentMethod)) {
    return (
      <CardBpdToggle
        key={getPaymentMethodHash(paymentMethod.info)}
        card={paymentMethod}
      />
    );
  }
  if (isBancomat(paymentMethod)) {
    return (
      <CardBpdToggle
        key={getPaymentMethodHash(paymentMethod.info)}
        card={paymentMethod}
      />
    );
  }
  return null;
};

import { fromNullable } from "fp-ts/lib/Option";
import {
  CreditCardPaymentMethod,
  CreditCardType,
  PaymentMethod
} from "../types/pagopa";
import { badgeType } from "../types/paymentMethodCapabilities";

export const brandsBlackList = new Set<CreditCardType>(["MAESTRO"]);

/**
 * Check if a CreditCard is enabled to pay on IO.
 *
 * A CreditCard is enabled if it isn't included in the brandsBlacklist or if the brand is not recognized.
 *
 * @param creditCard
 */
export const isSupportedBrand = (
  creditCard: CreditCardPaymentMethod
): boolean =>
  CreditCardType.decode(creditCard.info.brand).fold(
    () => true,
    pm => !brandsBlackList.has(pm)
  );

export const extractBadgeType = (paymentMethod: PaymentMethod): badgeType => {
  const badgeType = fromNullable(paymentMethod).map<badgeType>(pM => {
    switch (pM.kind) {
      case "CreditCard":
        return pM.pagoPA
          ? isSupportedBrand(pM)
            ? "available"
            : "arriving"
          : "not_available";
      case "Satispay":
        return "arriving";
      default:
        return "not_available";
    }
  });
  return badgeType.getOrElse("not_available");
};

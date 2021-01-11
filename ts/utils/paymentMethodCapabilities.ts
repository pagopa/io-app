import { fromNullable } from "fp-ts/lib/Option";
import { CreditCardType, isCreditCard, PaymentMethod } from "../types/pagopa";
import { PaymentSupportStatus } from "../types/paymentMethodCapabilities";

export const brandsBlackList = new Set<CreditCardType>(["MAESTRO"]);

/**
 * check if a payment method is supported to make payment via pagaPA platform.
 * a credit card is supported if it isn't included in the brandsBlacklist or if its brand is not recognized.
 * @param paymentMethod
 */
export const canMethodPay = (paymentMethod: PaymentMethod): boolean => {
  if (paymentMethod.pagoPA === false) {
    return false;
  }
  if (isCreditCard(paymentMethod)) {
    return CreditCardType.decode(paymentMethod.info.brand).fold(
      () => true,
      pm => !brandsBlackList.has(pm)
    );
  }
  return paymentMethod.pagoPA;
};

/**
 * check if a payment method is supported or not
 * "available" -> can pay
 * "arriving" -> will pay
 * "not_available" -> can't pay
 */
export const isPaymentMethodSupported = (
  paymentMethod: PaymentMethod
): PaymentSupportStatus => {
  const badgeType = fromNullable(paymentMethod).map<PaymentSupportStatus>(
    pM => {
      switch (pM.kind) {
        case "CreditCard":
          return pM.pagoPA
            ? canMethodPay(pM)
              ? "available"
              : "arriving"
            : "not_available";
        case "Satispay":
        case "BPay":
          return "arriving";
        default:
          return "not_available";
      }
    }
  );
  return badgeType.getOrElse("not_available");
};

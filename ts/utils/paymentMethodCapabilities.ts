import { none, Option, some } from "fp-ts/lib/Option";
import { TypeEnum } from "../../definitions/pagopa/walletv2/CardInfo";
import {
  CreditCardPaymentMethod,
  CreditCardType,
  EnableableFunctionsTypeEnum,
  isCreditCard,
  PaymentMethod
} from "../types/pagopa";
import { PaymentSupportStatus } from "../types/paymentMethodCapabilities";
import { hasFunctionEnabled } from "./walletv2";

export const brandsBlackList = new Set<CreditCardType>();

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
      // eslint-disable-next-line sonarjs/no-empty-collection
      pm => !brandsBlackList.has(pm)
    );
  }
  return paymentMethod.pagoPA;
};

export const isCobadge = (paymentMethod: CreditCardPaymentMethod) =>
  paymentMethod.info?.issuerAbiCode && paymentMethod.info.type !== TypeEnum.PRV;

/**
 * Return a custom representation for a payment method who cannot pay
 * @param paymentMethod
 */
const paymentNotSupportedCustomRepresentation = (
  paymentMethod: PaymentMethod
): PaymentSupportStatus => {
  switch (paymentMethod.kind) {
    case "CreditCard":
      return isCobadge(paymentMethod)
        ? "onboardableNotImplemented"
        : "notAvailable";
    case "Satispay":
    case "BPay":
      return "arriving";
    default:
      return "notAvailable";
  }
};

/**
 * Check if a payment method is supported or not
 * If the payment method have the enableable function pagoPA, can always pay ("available")
 * "available" -> can pay
 * "arriving" -> will pay
 * "notAvailable" -> can't pay
 * "onboardableNotImplemented" -> can onboard a card that can pay but is not yet implemented
 */
export const isPaymentSupported = (
  paymentMethod: PaymentMethod
): PaymentSupportStatus => {
  const paymentSupported: Option<PaymentSupportStatus> = hasFunctionEnabled(
    paymentMethod,
    EnableableFunctionsTypeEnum.pagoPA
  )
    ? some("available")
    : none;

  const notAvailableCustomRepresentation = some(
    paymentNotSupportedCustomRepresentation(paymentMethod)
  );

  return paymentSupported
    .alt(notAvailableCustomRepresentation)
    .getOrElse("notAvailable");
};

import { none, Option, some } from "fp-ts/lib/Option";
import { EnableableFunctionsEnum } from "../../definitions/pagopa/EnableableFunctions";
import { TypeEnum } from "../../definitions/pagopa/walletv2/CardInfo";
import { CreditCardPaymentMethod, PaymentMethod } from "../types/pagopa";
import { PaymentSupportStatus } from "../types/paymentMethodCapabilities";
import { hasFunctionEnabled } from "./walletv2";

/**
 * check if a payment method is supported to make payment via pagaPA platform.
 * it doesn't use the payment method can actually pay
 * @param paymentMethod
 */
export const hasPaymentFeature = (paymentMethod: PaymentMethod): boolean =>
  hasFunctionEnabled(paymentMethod, EnableableFunctionsEnum.pagoPA);

export const isEnabledToPay = (paymentMethod: PaymentMethod): boolean =>
  hasPaymentFeature(paymentMethod) && paymentMethod.pagoPA === true;

export const isDisabledToPay = (paymentMethod: PaymentMethod): boolean =>
  hasPaymentFeature(paymentMethod) && paymentMethod.pagoPA === false;

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
    case "Satispay":
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
  const paymentSupported: Option<PaymentSupportStatus> = hasPaymentFeature(
    paymentMethod
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

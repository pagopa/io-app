import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { EnableableFunctionsEnum } from "../../definitions/pagopa/EnableableFunctions";
import { TypeEnum } from "../../definitions/pagopa/walletv2/CardInfo";
import { CreditCardPaymentMethod, PaymentMethod } from "../types/pagopa";
import { PaymentSupportStatus } from "../types/paymentMethodCapabilities";
import { hasFunctionEnabled } from "./walletv2";

/**
 * return true if the payment method has the payment feature
 */
export const hasPaymentFeature = (paymentMethod: PaymentMethod): boolean =>
  hasFunctionEnabled(paymentMethod, EnableableFunctionsEnum.pagoPA);

/**
 * return true if the payment method has the payment feature and the payment flag enabled
 */
export const isEnabledToPay = (paymentMethod: PaymentMethod): boolean =>
  hasPaymentFeature(paymentMethod) && paymentMethod.pagoPA === true;

/**
 * return true if the payment method has the payment feature and the payment flag disabled
 */
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
  const paymentSupported: O.Option<PaymentSupportStatus> = hasPaymentFeature(
    paymentMethod
  )
    ? O.some("available")
    : O.none;

  const notAvailableCustomRepresentation = O.some(
    paymentNotSupportedCustomRepresentation(paymentMethod)
  );

  return pipe(
    paymentSupported,
    O.alt(() => notAvailableCustomRepresentation),
    O.getOrElseW(() => "notAvailable" as const)
  );
};

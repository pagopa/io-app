/**
 * Union of all possible status of a supporting payment method
 */
export type PaymentSupportStatus =
  | "available"
  | "arriving"
  | "notAvailable"
  | "onboardableNotImplemented";

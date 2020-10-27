import { BpdDetailsActions } from "./details";
import { BpdIbanActions } from "./iban";
import { BpdOnboardingActions } from "./onboarding";
import { BpdPaymentMethod } from "./paymentMethods";

export type BpdActions =
  | BpdOnboardingActions
  | BpdDetailsActions
  | BpdIbanActions
  | BpdPaymentMethod;

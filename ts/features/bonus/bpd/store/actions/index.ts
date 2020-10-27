import { BpdDetailsActions } from "./details";
import { BpdIbanActions } from "./iban";
import { BpdOnboardingActions } from "./onboarding";
import { BpdPaymentMethod } from "./paymentMethods";
import { BpdPeriodsAction } from "./periods";

export type BpdActions =
  | BpdOnboardingActions
  | BpdDetailsActions
  | BpdIbanActions
  | BpdPaymentMethod
  | BpdPeriodsAction;

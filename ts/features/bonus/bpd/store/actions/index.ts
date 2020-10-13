import { BpdDetailsActions } from "./details";
import { BpdIbanActions } from "./iban";
import { BpdOnboardingActions } from "./onboarding";

export type BpdActions =
  | BpdOnboardingActions
  | BpdDetailsActions
  | BpdIbanActions;

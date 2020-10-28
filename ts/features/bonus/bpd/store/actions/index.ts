import { BpdAmountAction } from "./amount";
import { BpdDetailsActions } from "./details";
import { BpdIbanActions } from "./iban";
import { BpdOnboardingActions } from "./onboarding";
import { BpdPaymentMethod } from "./paymentMethods";
import { BpdPeriodsAction } from "./periods";
import { BpdTransactionsAction } from "./transactions";

export type BpdActions =
  | BpdOnboardingActions
  | BpdDetailsActions
  | BpdIbanActions
  | BpdPaymentMethod
  | BpdPeriodsAction
  | BpdAmountAction
  | BpdTransactionsAction;

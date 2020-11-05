import { BpdAmountAction } from "./amount";
import { BpdDetailsActions } from "./details";
import { BpdIbanActions } from "./iban";
import { BpdOnboardingActions } from "./onboarding";
import { BpdPaymentMethodActions } from "./paymentMethods";
import { BpdPeriodsAction } from "./periods";
import { BpdSelectPeriodAction } from "./selectedPeriod";
import { BpdTransactionsAction } from "./transactions";

export type BpdActions =
  | BpdOnboardingActions
  | BpdDetailsActions
  | BpdIbanActions
  | BpdPaymentMethodActions
  | BpdPeriodsAction
  | BpdAmountAction
  | BpdTransactionsAction
  | BpdSelectPeriodAction;

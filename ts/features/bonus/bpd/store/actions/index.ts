import { BpdDetailsActions } from "./details";
import { BpdIbanActions } from "./iban";
import { BpdOnboardingActions } from "./onboarding";
import { BpdPaymentMethodActions } from "./paymentMethods";
import { BpdPeriodsAction } from "./periods";
import { BpdSelectPeriodAction } from "./selectedPeriod";
import { BpdTransactionsAction } from "./transactions";
import { OptInPaymentMethodsActions } from "./optInPaymentMethods";

export type BpdActions =
  | BpdOnboardingActions
  | BpdDetailsActions
  | BpdIbanActions
  | BpdPaymentMethodActions
  | BpdPeriodsAction
  | BpdTransactionsAction
  | BpdSelectPeriodAction
  | OptInPaymentMethodsActions;

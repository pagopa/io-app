import * as O from "fp-ts/lib/Option";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { StatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { InitiativeBeneficiaryRuleDTO } from "../../../../../definitions/idpay/InitiativeBeneficiaryRuleDTO";
import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { OnboardingFailure } from "../types/OnboardingFailure";
import { SelfConsentTextDTO } from "../../../../../definitions/idpay/SelfConsentTextDTO";

export type Context = {
  readonly serviceId: string;
  readonly initiative: O.Option<InitiativeDataDTO>;
  readonly onboardingStatus: O.Option<StatusEnum>;
  readonly requiredCriteria: O.Option<InitiativeBeneficiaryRuleDTO>;
  readonly selfDeclarationsMultiPage: number;
  readonly selfDeclarationsMultiAnwsers: Record<number, SelfConsentMultiDTO>;
  readonly selfDeclarationsBoolAnswers: Record<string, boolean>;
  readonly failure: O.Option<OnboardingFailure>;
  readonly activeTextConsentPage: number;
  readonly selfDeclarationsTextAnswers: Record<string, SelfConsentTextDTO>;
  readonly isPushNotificationsEnabled: boolean;
  readonly hasInbox: boolean;
  readonly currentStep: number;
};

export const InitialContext: Context = {
  serviceId: "",
  initiative: O.none,
  onboardingStatus: O.none,
  requiredCriteria: O.none,
  selfDeclarationsMultiPage: 0,
  selfDeclarationsMultiAnwsers: {},
  selfDeclarationsBoolAnswers: {},
  failure: O.none,
  activeTextConsentPage: 0,
  selfDeclarationsTextAnswers: {},
  isPushNotificationsEnabled: false,
  hasInbox: false,
  currentStep: 0
};

import * as O from "fp-ts/lib/Option";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { StatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { OnboardingFailure } from "../types/OnboardingFailure";
import { SelfDeclarationTextDTO } from "../../../../../definitions/idpay/SelfDeclarationTextDTO";

export type Context = {
  readonly serviceId: string;
  readonly initiative: O.Option<InitiativeDataDTO>;
  readonly onboardingStatus: O.Option<StatusEnum>;
  readonly requiredCriteria: O.Option<RequiredCriteriaDTO>;
  readonly selfDeclarationsMultiPage: number;
  readonly selfDeclarationsMultiAnwsers: Record<number, SelfConsentMultiDTO>;
  readonly selfDeclarationsBoolAnswers: Record<string, boolean>;
  readonly failure: O.Option<OnboardingFailure>;
  readonly activeTextConsentPage: number;
  readonly selfDeclarationsTextAnswers: Record<string, SelfDeclarationTextDTO>;
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
  selfDeclarationsTextAnswers: {}
};

import * as O from "fp-ts/lib/Option";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { StatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { OnboardingFailure } from "../types/OnboardingFailure";

export interface Context {
  readonly serviceId: string;
  readonly initiative: O.Option<InitiativeDataDTO>;
  readonly onboardingStatus: O.Option<StatusEnum>;
  readonly requiredCriteria: O.Option<RequiredCriteriaDTO>;
  readonly selfDeclarationsMultiPage: number;
  readonly selfDeclarationsMultiAnwsers: Record<number, SelfConsentMultiDTO>;
  readonly selfDeclarationsBoolAnswers: Record<string, boolean>;
  readonly failure: O.Option<OnboardingFailure>;
}

export const Context: Context = {
  serviceId: "",
  initiative: O.none,
  onboardingStatus: O.none,
  requiredCriteria: O.none,
  selfDeclarationsMultiPage: 0,
  selfDeclarationsMultiAnwsers: {},
  selfDeclarationsBoolAnswers: {},
  failure: O.none
};

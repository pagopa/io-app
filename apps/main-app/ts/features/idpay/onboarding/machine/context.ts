import { InitiativeDataDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDataDTO";
import { OnboardingInitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/OnboardingInitiativeDTO";
import { StatusEnum } from "@io-app/api-types/generated/definitions/idpay/OnboardingStatusDTO";
import { SelfConsentMultiDTO } from "@io-app/api-types/generated/definitions/idpay/SelfConsentMultiDTO";
import { SelfConsentMultiTypeDTO } from "@io-app/api-types/generated/definitions/idpay/SelfConsentMultiTypeDTO";
import { SelfConsentTextDTO } from "@io-app/api-types/generated/definitions/idpay/SelfConsentTextDTO";
import * as O from "fp-ts/lib/Option";

import { OnboardingFailure } from "../types/OnboardingFailure";

export type Context = {
  readonly activeTextConsentPage: number;
  readonly currentStep: number;
  readonly failure: O.Option<OnboardingFailure>;
  readonly hasInbox: boolean;
  readonly initiative: O.Option<InitiativeDataDTO>;
  readonly isPushNotificationsEnabled: boolean;
  readonly onboardingStatus: O.Option<StatusEnum>;
  readonly requiredCriteria: O.Option<OnboardingInitiativeDTO>;
  readonly selfDeclarationsBoolAnswers: Record<string, boolean>;
  readonly selfDeclarationsMultiAnswers: Record<
    number,
    SelfConsentMultiDTO | SelfConsentMultiTypeDTO
  >;
  readonly selfDeclarationsMultiPage: number;
  readonly selfDeclarationsTextAnswers: Record<string, SelfConsentTextDTO>;
  readonly serviceId: string;
};

export const InitialContext: Context = {
  serviceId: "",
  initiative: O.none,
  onboardingStatus: O.none,
  requiredCriteria: O.none,
  selfDeclarationsMultiPage: 0,
  selfDeclarationsMultiAnswers: {},
  selfDeclarationsBoolAnswers: {},
  failure: O.none,
  activeTextConsentPage: 0,
  selfDeclarationsTextAnswers: {},
  isPushNotificationsEnabled: false,
  hasInbox: false,
  currentStep: 0
};

import { InitiativeDataDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDataDTO";
import { OnboardingInitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/OnboardingInitiativeDTO";
import { StatusEnum } from "@io-app/api-types/generated/definitions/idpay/OnboardingStatusDTO";
import { SelfConsentMultiDTO } from "@io-app/api-types/generated/definitions/idpay/SelfConsentMultiDTO";
import { SelfConsentMultiTypeDTO } from "@io-app/api-types/generated/definitions/idpay/SelfConsentMultiTypeDTO";
import { SelfConsentTextDTO } from "@io-app/api-types/generated/definitions/idpay/SelfConsentTextDTO";

import { OnboardingFailure } from "../types/OnboardingFailure";

export type Context = {
  readonly activeTextConsentPage: number;
  readonly currentStep: number;
  readonly failure: OnboardingFailure | undefined;
  readonly hasInbox: boolean;
  readonly initiative: InitiativeDataDTO | undefined;
  readonly isPushNotificationsEnabled: boolean;
  readonly onboardingStatus: StatusEnum | undefined;
  readonly requiredCriteria: OnboardingInitiativeDTO | undefined;
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
  initiative: undefined,
  onboardingStatus: undefined,
  requiredCriteria: undefined,
  selfDeclarationsMultiPage: 0,
  selfDeclarationsMultiAnswers: {},
  selfDeclarationsBoolAnswers: {},
  failure: undefined,
  activeTextConsentPage: 0,
  selfDeclarationsTextAnswers: {},
  isPushNotificationsEnabled: false,
  hasInbox: false,
  currentStep: 0
};

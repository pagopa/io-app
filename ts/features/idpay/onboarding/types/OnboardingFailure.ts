import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum OnboardingFailureEnum {
  GENERIC = "GENERIC",
  INITIATIVE_NOT_STARTED = "INITIATIVE_NOT_STARTED",
  INITIATIVE_ENDED = "INITIATIVE_ENDED",
  BUDGET_EXHAUSTED = "BUDGET_EXHAUSTED",
  UNSATISFIED_REQUIREMENTS = "UNSATISFIED_REQUIREMENTS",
  USER_NOT_IN_WHITELIST = "USER_NOT_IN_WHITELIST",
  ON_EVALUATION = "ON_EVALUATION",
  NOT_ELIGIBLE = "NOT_ELIGIBLE",
  USER_ONBOARDED = "ONBOARDED",
  USER_UNSUBSCRIBED = "UNSUBSCRIBED",
  SESSION_EXPIRED = "SESSION_EXPIRED"
}

export type OnboardingFailure = t.TypeOf<typeof OnboardingFailure>;
export const OnboardingFailure = enumType<OnboardingFailureEnum>(
  OnboardingFailureEnum,
  "OnboardingFailureEnum"
);

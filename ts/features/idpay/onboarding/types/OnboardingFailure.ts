import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum OnboardingFailureEnum {
  GENERIC = "GENERIC",
  INITIATIVE_NOT_FOUND = "NOT_FOUND",
  UNSATISFIED_REQUIREMENTS = "UNSATISFIED_REQUIREMENTS",
  USER_NOT_IN_WHITELIST = "USER_NOT_IN_WHITELIST",
  INITIATIVE_NOT_STARTED = "INITIATIVE_NOT_STARTED",
  INITIATIVE_ENDED = "INITIATIVE_ENDED",
  BUDGET_EXHAUSTED = "BUDGET_EXHAUSTED",
  USER_UNSUBSCRIBED = "UNSUBSCRIBED",
  USER_ONBOARDED = "ONBOARDED",
  NOT_ELIGIBLE = "NOT_ELIGIBLE",
  ON_EVALUATION = "ON_EVALUATION",
  SESSION_EXPIRED = "SESSION_EXPIRED"
}

export type OnboardingFailure = t.TypeOf<typeof OnboardingFailure>;
export const OnboardingFailure = enumType<OnboardingFailureEnum>(
  OnboardingFailureEnum,
  "OnboardingFailureEnum"
);

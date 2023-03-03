import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum OnboardingFailureEnum {
  GENERIC = "GENERIC",
  NOT_STARTED = "NOT_STARTED",
  ENDED = "ENDED",
  NO_BUDGET = "NO_BUDGET",
  SUSPENDED = "SUSPENDED",
  NO_REQUIREMENTS = "NO_REQUIREMENTS",
  ON_EVALUATION = "ON_EVALUATION",
  NOT_ELIGIBLE = "NOT_ELIGIBLE",
  ONBOARDED = "ONBOARDED",
  UNSUBSCRIBED = "UNSUBSCRIBED"
}

export type OnboardingFailure = t.TypeOf<typeof OnboardingFailure>;
export const OnboardingFailure = enumType<OnboardingFailureEnum>(
  OnboardingFailureEnum,
  "OnboardingFailureEnum"
);

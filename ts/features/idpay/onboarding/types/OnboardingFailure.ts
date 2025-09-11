import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";
import { CodeEnum } from "../../../../../definitions/idpay/OnboardingErrorDTO";

enum OnboardingStatusEnum {
  SESSION_EXPIRED = "SESSION_EXPIRED",
  USER_ONBOARDED = "USER_ONBOARDED",
  NOT_ELIGIBLE = "NOT_ELIGIBLE",
  ON_EVALUATION = "ON_EVALUATION"
}

export type OnboardingFailureEnum = OnboardingStatusEnum | CodeEnum;
export const OnboardingFailureEnum = {
  ...OnboardingStatusEnum,
  ...CodeEnum
};

export type OnboardingFailure = t.TypeOf<typeof OnboardingFailure>;
export const OnboardingFailure = enumType<OnboardingFailureEnum>(
  OnboardingFailureEnum,
  "OnboardingFailureEnum"
);

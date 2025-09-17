import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";
import { CodeEnum } from "../../../../../definitions/idpay/OnboardingErrorDTO";

enum OnboardingStatusEnum {
  SESSION_EXPIRED = "SESSION_EXPIRED",
  NOT_ELIGIBLE = "NOT_ELIGIBLE"
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

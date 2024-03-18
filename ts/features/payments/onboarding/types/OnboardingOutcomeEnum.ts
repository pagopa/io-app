import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum WalletOnboardingOutcomeEnum {
  SUCCESS = "0",
  GENERIC_ERROR = "1",
  AUTH_ERROR = "2",
  TIMEOUT = "4",
  CANCELED_BY_USER = "8",
  INVALID_SESSION = "14",
  ALREADY_ONBOARDED = "15",
  BPAY_NOT_FOUND = "16"
}

export type WalletOnboardingOutcome = t.TypeOf<typeof WalletOnboardingOutcome>;
export const WalletOnboardingOutcome = enumType<WalletOnboardingOutcomeEnum>(
  WalletOnboardingOutcomeEnum,
  "WalletOnboardingOutcome"
);

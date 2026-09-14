import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum WalletOnboardingOutcomeEnum {
  ALREADY_ONBOARDED = "15",
  AUTH_ERROR = "2",
  BE_KO = "99",
  BPAY_NOT_FOUND = "16",
  CANCELED_BY_USER = "8",
  GENERIC_ERROR = "1",
  INVALID_SESSION = "14",
  PSP_ERROR_ONBOARDING = "25",
  SUCCESS = "0",
  TIMEOUT = "4"
}

export type WalletOnboardingOutcome = t.TypeOf<typeof WalletOnboardingOutcome>;
export const WalletOnboardingOutcome = enumType<WalletOnboardingOutcomeEnum>(
  WalletOnboardingOutcomeEnum,
  "WalletOnboardingOutcome"
);

export function getWalletOnboardingOutcomeEnumByValue(
  value: string
): string | undefined {
  return (
    Object.keys(WalletOnboardingOutcomeEnum) as Array<
      keyof typeof WalletOnboardingOutcomeEnum
    >
  ).find(key => WalletOnboardingOutcomeEnum[key] === value);
}

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
  BPAY_NOT_FOUND = "16",
  PSP_ERROR_ONBOARDING = "25",
  BE_KO = "99"
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

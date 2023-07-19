import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { WalletOnboardingStartResponse } from "../../types";

export type WalletOnboardingStartPayloadType = { walletToken: string };

export const walletStartOnboarding = createAsyncAction(
  "WALLET_ONBOARDING_START_REQUEST",
  "WALLET_ONBOARDING_START_SUCCESS",
  "WALLET_ONBOARDING_START_FAILURE"
)<
  WalletOnboardingStartPayloadType,
  WalletOnboardingStartResponse,
  NetworkError
>();

export type WalletOnboardingActions = ActionType<typeof walletStartOnboarding>;

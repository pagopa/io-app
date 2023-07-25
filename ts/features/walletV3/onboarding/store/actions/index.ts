import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { WalletCreateResponse } from "../../../../../../definitions/pagopa/walletv3/WalletCreateResponse";

export const walletStartOnboarding = createAsyncAction(
  "WALLET_ONBOARDING_START_REQUEST",
  "WALLET_ONBOARDING_START_SUCCESS",
  "WALLET_ONBOARDING_START_FAILURE",
  "WALLET_ONBOARDING_START_CANCEL"
)<void, WalletCreateResponse, NetworkError, void>();

export type WalletOnboardingActions = ActionType<typeof walletStartOnboarding>;

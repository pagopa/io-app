import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { NetworkError } from "../../../../../utils/errors";
import {
  WalletInstanceAttestations,
  WalletInstanceStatus
} from "../../../common/utils/itwTypesUtils";

/**
 * This action stores the Wallet Instance Attestation
 */
export const itwWalletInstanceAttestationStore = createStandardAction(
  "ITW_WALLET_INSTANCE_ATTESTATION_STORE"
)<WalletInstanceAttestations>();

/**
 * This action handles the Wallet Instance Status fetch
 */
export const itwUpdateWalletInstanceStatus = createAsyncAction(
  "ITW_WALLET_INSTANCE_STATUS_REQUEST",
  "ITW_WALLET_INSTANCE_STATUS_SUCCESS",
  "ITW_WALLET_INSTANCE_STATUS_FAILURE",
  "ITW_WALLET_INSTANCE_STATUS_CANCEL"
)<void, WalletInstanceStatus, NetworkError, undefined>();

/**
 * This action sets whether a wallet instance renewal has already failed.
 * Used to prevent re-entering the recovery block on subsequent actor retries.
 */
export const itwSetWalletInstanceRenewalError = createStandardAction(
  "ITW_SET_WALLET_INSTANCE_RENEWAL_ERROR"
)<boolean>();

export type ItwWalletInstanceActions =
  | ActionType<typeof itwSetWalletInstanceRenewalError>
  | ActionType<typeof itwUpdateWalletInstanceStatus>
  | ActionType<typeof itwWalletInstanceAttestationStore>;

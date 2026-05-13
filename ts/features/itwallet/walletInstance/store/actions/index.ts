import {
  ActionType,
  createStandardAction,
  createAsyncAction
} from "typesafe-actions";
import {
  WalletInstanceAttestations,
  WalletInstanceStatus
} from "../../../common/utils/itwTypesUtils";
import { NetworkError } from "../../../../../utils/errors";

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

/**
 * Store multiple Wallet Unit Attestations under the provided IDs.
 */
export const itwWalletUnitAttestationsStore = createStandardAction(
  "ITW_WALLET_UNIT_ATTESTATIONS_STORE"
)<Record<string, string>>();

/**
 * Removes multiple Wallet Unit Attestations by their IDs.
 */
export const itwWalletUnitAttestationsRemoveById = createStandardAction(
  "ITW_WALLET_UNIT_ATTESTATIONS_REMOVE_BY_ID"
)<ReadonlyArray<string>>();

/**
 * This action sets whether a wallet instance is remotely active.
 */
export const itwSetWalletInstanceRemotelyActive = createStandardAction(
  "ITW_SET_WALLET_INSTANCE_REMOTELY_ACTIVE"
)<boolean | undefined>();

export type ItwWalletInstanceActions =
  | ActionType<typeof itwWalletInstanceAttestationStore>
  | ActionType<typeof itwUpdateWalletInstanceStatus>
  | ActionType<typeof itwSetWalletInstanceRenewalError>
  | ActionType<typeof itwWalletUnitAttestationsStore>
  | ActionType<typeof itwWalletUnitAttestationsRemoveById>
  | ActionType<typeof itwSetWalletInstanceRemotelyActive>;

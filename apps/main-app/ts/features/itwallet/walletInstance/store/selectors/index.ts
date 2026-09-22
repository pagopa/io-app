import * as pot from "@pagopa/ts-commons/lib/pot";

import { GlobalState } from "../../../../../store/reducers/types";

/**
 * Selector to get the wallet instance attestation
 */
export const itwWalletInstanceAttestationSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.attestation;

/* Selector to get the wallet instance status */
export const itwWalletInstanceStatusSelector = (state: GlobalState) =>
  pot.toUndefined(state.features.itWallet.walletInstance.status);

/**
 * Returns true when it was not possible to retrieve the wallet instance status because of unexpected errors,
 * hence we cannot know whether the wallet instance is valid or has been revoked.
 */
export const itwIsWalletInstanceStatusFailureSelector = (state: GlobalState) =>
  pot.isError(state.features.itWallet.walletInstance.status);

/**
 * Selector that returns whether a wallet instance renewal has already failed.
 * Used to prevent re-entering the recovery block on subsequent actor retries.
 */
export const itwWalletInstanceRenewalErrorSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.renewalError;

/**
 * Selector that returns all the Key Attestations in the store.
 */
export const itwKeyAttestationsSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.keyAttestations;

/**
 * Returns whether the user has an already active wallet instance but the actual local wallet is not active.
 * @param state the application global state
 */
export const itwIsRemotelyActiveSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.isRemotelyActive;

/**
 * [1.3.3+] Selector that returns the Status List entry for the wallet instance, if available.
 * This is used to check the validity of the wallet instance.
 *
 * @param state the application global state
 * @returns the Status List entry for the wallet instance, if available
 */
export const itwWalletInstanceStatusListSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.statusList;

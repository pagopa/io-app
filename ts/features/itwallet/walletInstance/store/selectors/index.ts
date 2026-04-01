import * as pot from "@pagopa/ts-commons/lib/pot";
import { differenceInHours } from "date-fns";
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
 * Selector to get the ISO-8601 date of the last successful Wallet Instance
 * status update.
 */
export const itwLastStatusUpdateDateSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.lastStatusUpdateDate;

/**
 * Returns true if a fresh Wallet Instance status check is needed,
 * i.e. no check has ever been performed or the last one was more than 24 hours ago.
 * Used by the background fetch saga to avoid redundant network calls.
 */
export const itwNeedWalletInstanceStatusCheck = (state: GlobalState) => {
  const lastStatusUpdateDate =
    state.features.itWallet.walletInstance.lastStatusUpdateDate;
  if (!lastStatusUpdateDate) {
    return true;
  }
  return differenceInHours(new Date(), new Date(lastStatusUpdateDate)) >= 24;
};

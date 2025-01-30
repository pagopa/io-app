import * as pot from "@pagopa/ts-commons/lib/pot";
import { differenceInHours } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { flow } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { isWalletInstanceAttestationValid } from "../../../common/utils/itwAttestationUtils";

/* Selector to get the wallet instance attestation */
export const itwWalletInstanceAttestationSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.attestation;

/* Selector to check if the attestation is valid */
export const itwIsWalletInstanceAttestationValidSelector = createSelector(
  itwWalletInstanceAttestationSelector,
  flow(
    O.fromNullable,
    O.map(isWalletInstanceAttestationValid),
    O.getOrElse(() => false)
  )
);

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
 * Selector to get the last status update date
 */
export const itwLastStatusUpdateDateSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.lastStatusUpdateDate;

/**
 * Selector to get the last status update date
 */
export const itwNeedWalletInstanceStatusCheck = (state: GlobalState) => {
  const lastStatusUpdateDate =
    state.features.itWallet.walletInstance.lastStatusUpdateDate;
  if (!lastStatusUpdateDate) {
    return true;
  }
  // Check if 24 hours have passed since the last status update
  return differenceInHours(new Date(), new Date(lastStatusUpdateDate)) >= 24;
};

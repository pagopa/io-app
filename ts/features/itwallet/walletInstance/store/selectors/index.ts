import * as O from "fp-ts/lib/Option";
import { flow } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { isWalletInstanceAttestationValid } from "../../../common/utils/itwAttestationUtils";
import { FAILURE_STATUS } from "../reducers";

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
  state.features.itWallet.walletInstance.status;

/**
 * Returns true when it was not possible to retrieve the wallet instance status,
 * for instance because of unexpected errors.
 */
export const itwIsWalletInstanceStatusFailureSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.status === FAILURE_STATUS;

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

/* Selector to get the alert shown status */
export const itwWalletInstanceAlertShownSelector = createSelector(
  (state: GlobalState) =>
    state.features.itWallet.walletInstance.revocationAlertShown,
  revocationAlertShown => revocationAlertShown
);

/* Selector to get the wallet instance status */
export const itwWalletInstanceStatusSelector = createSelector(
  (state: GlobalState) => state.features.itWallet.walletInstance.status,
  status => status
);

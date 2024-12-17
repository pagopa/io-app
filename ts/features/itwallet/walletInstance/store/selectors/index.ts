import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
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
  (state: GlobalState) => state.features.itWallet.walletInstance.revocation,
  revocation => revocation.alertShown
);

/* Selector to get the wallet instance status */
export const itwWalletInstanceRevocationStatusSelector = createSelector(
  (state: GlobalState) => state.features.itWallet.walletInstance.revocation,
  revocation =>
    pipe(
      O.fromNullable(revocation.isRevoked),
      O.filter(Boolean),
      O.map(() => ({
        isRevoked: true,
        revocationReason: revocation.revocationReason
      })),
      O.getOrElse(() => ({ isRevoked: false }))
    )
);

import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { GlobalState } from "../../../../../store/reducers/types";
import { isItwCredential } from "../../../common/utils/itwCredentialUtils";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../../issuance/store/selectors";

/**
 * The wallet instance is not active and there is no associated integrity key tag.
 * The user cannot get any credential.
 */
export const itwLifecycleIsInstalledSelector = (state: GlobalState) =>
  O.isNone(state.features.itWallet.issuance.integrityKeyTag);

/**
 * The wallet instance is registered and there is an associated integrity key tag.
 * The user can get a wallet attestation and an eID.
 */
export const itwLifecycleIsOperationalSelector = (state: GlobalState) =>
  O.isSome(state.features.itWallet.issuance.integrityKeyTag) &&
  O.isNone(itwCredentialsEidSelector(state));

/**
 * The wallet instance is registered, there is an associated integrity key tag
 * and the user has been issued a valid eID. The user can now get other credentials.
 */
export const itwLifecycleIsValidSelector = (state: GlobalState) =>
  O.isSome(state.features.itWallet.issuance.integrityKeyTag) &&
  O.isSome(itwCredentialsEidSelector(state));

/**
 * Convenience selector that joins the states operational or valid.
 */
export const itwLifecycleIsOperationalOrValid = (state: GlobalState) =>
  itwLifecycleIsOperationalSelector(state) ||
  itwLifecycleIsValidSelector(state);

/**
 * The wallet instance is a **valid IT-Wallet instance**. This means the eID
 * is a PID L3 credential, that is only issued in the context of IT-Wallet.
 */
export const itwLifecycleIsITWalletValidSelector = createSelector(
  [itwIntegrityKeyTagSelector, itwCredentialsEidSelector],
  (integrityKeyTagOption, eidOption) =>
    pipe(
      sequenceS(O.Monad)({
        eid: eidOption,
        integrityKeyTag: integrityKeyTagOption
      }),
      O.map(({ eid }) => isItwCredential(eid.credential)),
      O.getOrElse(() => false)
    )
);

import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";

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
  O.isNone(state.features.itWallet.credentials.eid);

/**
 * The wallet instance is registered, there is an associated integrity key tag
 * and the user has been issued a valid eID. The user can now get other credentials.
 */
export const itwLifecycleIsValidSelector = (state: GlobalState) =>
  O.isSome(state.features.itWallet.issuance.integrityKeyTag) &&
  O.isSome(state.features.itWallet.credentials.eid);

/**
 * Convenience selector that joins the states operational or valid.
 */
export const itwLifecycleIsOperationalOrValid = (state: GlobalState) =>
  itwLifecycleIsOperationalSelector(state) ||
  itwLifecycleIsValidSelector(state);

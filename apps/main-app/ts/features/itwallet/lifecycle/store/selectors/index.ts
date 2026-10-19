import { createSelector } from "reselect";

import { GlobalState } from "../../../../../store/reducers/types";
import { itwIsFiscalCodeWhitelisted } from "../../../common/store/selectors/preferences";
import { isItwMinAppVersionSupportedSelector } from "../../../common/store/selectors/remoteConfig";
import { isItwCredential } from "../../../common/utils/itwCredentialUtils";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../../issuance/store/selectors";

/**
 * The lifecycle state of the wallet: which wallet the user has, and which one
 * they can get. It is the only value features should read to decide what to
 * render or which flow to start.
 *
 * Values are ordered from no wallet to IT-Wallet: every state from `DOC_IO` on
 * has an active wallet, so comparisons such as `lifecycle >= DOC_IO` rely on
 * this order.
 *
 * Remote availability (`isItwEnabledSelector`), offline access and the wallet
 * instance health are orthogonal to the lifecycle and are not part of it.
 */
export enum ItwLifecycleState {
  /** No wallet, the user can activate Documenti su IO */
  INACTIVE = 0,
  /** No wallet, the user can activate IT-Wallet */
  IT_WALLET_ELIGIBLE = 1,
  /** No wallet, IT-Wallet eligible but no NFC: restricted Documenti su IO */
  IT_WALLET_UNSUPPORTED = 2,
  /** Documenti su IO is active, IT-Wallet is not offered to the user */
  DOC_IO = 3,
  /** Documenti su IO active as restricted fallback (no NFC or no CIE) */
  DOC_IO_FALLBACK = 4,
  /** Documenti su IO is active, the user can upgrade to IT-Wallet */
  DOC_IO_UPGRADABLE = 5,
  /** IT-Wallet is active */
  IT_WALLET = 6
}

export const itwLifecycleStateSelector = createSelector(
  [
    itwIntegrityKeyTagSelector,
    itwCredentialsEidSelector,
    itwIsFiscalCodeWhitelisted,
    isItwMinAppVersionSupportedSelector,
    (state: GlobalState) =>
      state.features.itWallet.preferences.isItwActivationDisabled === true,
    (state: GlobalState) =>
      state.features.itWallet.preferences.isL2Fallback === true
  ],
  (
    integrityKeyTag,
    eid,
    isFiscalCodeWhitelisted,
    isMinAppVersionSupported,
    isNfcUnavailable,
    isL2Fallback
  ): ItwLifecycleState => {
    const isEligible = isFiscalCodeWhitelisted || isMinAppVersionSupported;

    if (integrityKeyTag === undefined || eid === undefined) {
      if (!isEligible) {
        return ItwLifecycleState.INACTIVE;
      }
      return isNfcUnavailable
        ? ItwLifecycleState.IT_WALLET_UNSUPPORTED
        : ItwLifecycleState.IT_WALLET_ELIGIBLE;
    }
    // Once obtained, an IT-Wallet PID does not depend on the eligibility anymore
    if (isItwCredential(eid)) {
      return ItwLifecycleState.IT_WALLET;
    }
    if (!isEligible) {
      return ItwLifecycleState.DOC_IO;
    }
    return isNfcUnavailable || isL2Fallback
      ? ItwLifecycleState.DOC_IO_FALLBACK
      : ItwLifecycleState.DOC_IO_UPGRADABLE;
  }
);

/** Whether a wallet, either Documenti su IO or IT-Wallet, is active. */
export const isWalletActive = (lifecycle: ItwLifecycleState) =>
  lifecycle >= ItwLifecycleState.DOC_IO;

/** Whether the user can activate IT-Wallet or already has it. */
export const isItWalletAvailable = (lifecycle: ItwLifecycleState) =>
  lifecycle !== ItwLifecycleState.INACTIVE &&
  lifecycle !== ItwLifecycleState.DOC_IO;

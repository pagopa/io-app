import { createSelector } from "reselect";

import { GlobalState } from "../../../../../store/reducers/types";
import { itwIsFiscalCodeWhitelisted } from "../../../common/store/selectors/preferences";
import { isItwMinAppVersionSupportedSelector } from "../../../common/store/selectors/remoteConfig";
import { isItwCredential } from "../../../common/utils/itwCredentialUtils";
import { itwCredentialsEidSelector } from "../../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../../issuance/store/selectors";

/**
 * The lifecycle state of the wallet. It is the only value features should read
 * to decide what to render or which flow to start.
 *
 * Each value maps a Wallet Instance state of the IT-Wallet technical
 * specifications (`INSTALLED`, `OPERATIONAL`, `VALID`) to the wallet the user
 * has or can get:
 *
 * - `INSTALLED`: no Wallet Instance is registered (no integrity key tag)
 * - `OPERATIONAL`: the Wallet Instance is registered but has no eID
 * - `VALID`: the Wallet Instance is registered and has an eID
 *
 * `UNINSTALLED` ends the lifecycle and cannot be observed by the app.
 *
 * @see https://italia.github.io/eid-wallet-it-docs/releases/1.4.6/en/wallet-instance-lifecycle.html
 *
 * Values are ordered by spec state, so comparisons such as
 * `lifecycle >= VALID_DOC_IO` rely on this order.
 *
 * Remote availability (`isItwEnabledSelector`), offline access and the wallet
 * instance health are orthogonal to the lifecycle and are not part of it.
 */
export enum ItwLifecycleState {
  /** No Wallet Instance, the user can activate Documenti su IO */
  INSTALLED = 0,
  /** No Wallet Instance, the user can activate IT-Wallet */
  INSTALLED_IT_WALLET_ELIGIBLE = 1,
  /**
   * No Wallet Instance, IT-Wallet eligible but no NFC: restricted Documenti su
   * IO
   */
  INSTALLED_IT_WALLET_UNSUPPORTED = 2,
  /** Wallet Instance without eID, the user can activate Documenti su IO */
  OPERATIONAL = 3,
  /** Wallet Instance without eID, the user can activate IT-Wallet */
  OPERATIONAL_IT_WALLET_ELIGIBLE = 4,
  /**
   * Wallet Instance without eID, IT-Wallet eligible but no NFC: restricted
   * Documenti su IO
   */
  OPERATIONAL_IT_WALLET_UNSUPPORTED = 5,
  /** Documenti su IO is active, IT-Wallet is not offered to the user */
  VALID_DOC_IO = 6,
  /** Documenti su IO active as restricted fallback (no NFC or no CIE) */
  VALID_DOC_IO_FALLBACK = 7,
  /** Documenti su IO is active, the user can upgrade to IT-Wallet */
  VALID_DOC_IO_UPGRADABLE = 8,
  /** IT-Wallet is active */
  VALID_IT_WALLET = 9
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

    if (integrityKeyTag === undefined) {
      if (!isEligible) {
        return ItwLifecycleState.INSTALLED;
      }
      return isNfcUnavailable
        ? ItwLifecycleState.INSTALLED_IT_WALLET_UNSUPPORTED
        : ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE;
    }
    if (eid === undefined) {
      if (!isEligible) {
        return ItwLifecycleState.OPERATIONAL;
      }
      return isNfcUnavailable
        ? ItwLifecycleState.OPERATIONAL_IT_WALLET_UNSUPPORTED
        : ItwLifecycleState.OPERATIONAL_IT_WALLET_ELIGIBLE;
    }
    // Once obtained, an IT-Wallet PID does not depend on the eligibility anymore
    if (isItwCredential(eid)) {
      return ItwLifecycleState.VALID_IT_WALLET;
    }
    if (!isEligible) {
      return ItwLifecycleState.VALID_DOC_IO;
    }
    return isNfcUnavailable || isL2Fallback
      ? ItwLifecycleState.VALID_DOC_IO_FALLBACK
      : ItwLifecycleState.VALID_DOC_IO_UPGRADABLE;
  }
);

/** Whether a Wallet Instance is registered, with or without an eID. */
export const isWalletInstanceRegistered = (lifecycle: ItwLifecycleState) =>
  lifecycle >= ItwLifecycleState.OPERATIONAL;

/** Whether a wallet, either Documenti su IO or IT-Wallet, is active. */
export const isWalletActive = (lifecycle: ItwLifecycleState) =>
  lifecycle >= ItwLifecycleState.VALID_DOC_IO;

/** Whether no wallet is active and the user can only activate Documenti su IO. */
export const isDocIoOnly = (lifecycle: ItwLifecycleState) =>
  lifecycle === ItwLifecycleState.INSTALLED ||
  lifecycle === ItwLifecycleState.OPERATIONAL;

/** Whether no wallet is active and the user can activate IT-Wallet. */
export const isItWalletEligible = (lifecycle: ItwLifecycleState) =>
  lifecycle === ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE ||
  lifecycle === ItwLifecycleState.OPERATIONAL_IT_WALLET_ELIGIBLE;

/** Whether no wallet is active and IT-Wallet is eligible but unsupported. */
export const isItWalletUnsupported = (lifecycle: ItwLifecycleState) =>
  lifecycle === ItwLifecycleState.INSTALLED_IT_WALLET_UNSUPPORTED ||
  lifecycle === ItwLifecycleState.OPERATIONAL_IT_WALLET_UNSUPPORTED;

/** Whether the user can activate IT-Wallet or already has it. */
export const isItWalletAvailable = (lifecycle: ItwLifecycleState) =>
  !isDocIoOnly(lifecycle) && lifecycle !== ItwLifecycleState.VALID_DOC_IO;

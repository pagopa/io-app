import * as O from "fp-ts/lib/Option";
import { call, put, select } from "typed-redux-saga/macro";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { getWalletInstanceStatus } from "../../common/utils/itwAttestationUtils";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import { itwIntegritySetServiceIsReady } from "../../issuance/store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { handleWalletInstanceResetSaga } from "./handleWalletInstanceResetSaga";
import { trackItwStatusWalletAttestationFailure } from "../../analytics";

export function* getStatusOrResetWalletInstance(integrityKeyTag: string) {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  try {
    const walletInstanceStatus = yield* call(
      getWalletInstanceStatus,
      integrityKeyTag,
      sessionToken
    );

    if (walletInstanceStatus.is_revoked) {
      yield* call(handleWalletInstanceResetSaga);
      trackItwStatusWalletAttestationFailure();
    }

    // Update wallet instance status
    yield* put(itwUpdateWalletInstanceStatus.success(walletInstanceStatus));
  } catch (e) {
    yield* put(itwUpdateWalletInstanceStatus.failure(getNetworkError(e)));
  }
}

/**
 * Saga responsible to check whether the wallet instance has not been revoked
 * or deleted. When this happens, the wallet is reset on the users's device.
 */
export function* checkWalletInstanceStateSaga(): Generator<
  ReduxSagaEffect,
  void
> {
  // We start the warming up process of the integrity service on Android
  try {
    const integrityServiceReadyResult: boolean = yield* call(
      ensureIntegrityServiceIsReady
    );
    yield* put(itwIntegritySetServiceIsReady(integrityServiceReadyResult));

    const isItwOperationalOrValid = yield* select(
      itwLifecycleIsOperationalOrValid
    );
    const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);

    // Only operational or valid wallet instances can be revoked.
    if (isItwOperationalOrValid && O.isSome(integrityKeyTag)) {
      yield* call(getStatusOrResetWalletInstance, integrityKeyTag.value);
    }
  } catch (e) {
    // Ignore the error, the integrity service is not available and an error will occur if the wallet requests an attestation
  }
}

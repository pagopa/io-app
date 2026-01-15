import * as O from "fp-ts/lib/Option";
import { call, put, select } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { getNetworkError } from "../../../../utils/errors";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { getWalletInstanceStatus } from "../../common/utils/itwAttestationUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import {
  trackItwWalletInstanceRevocation,
  trackItwStatusWalletAttestationFailure,
  trackItwWalletBadState
} from "../../analytics";
import { checkIntegrityServiceReadySaga } from "./checkIntegrityServiceReadySaga";
import { handleWalletInstanceResetSaga } from "./handleWalletInstanceResetSaga";

export function* getStatusOrResetWalletInstance(integrityKeyTag: string) {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  const env = getEnv(yield* select(selectItwEnv));

  try {
    const walletInstanceStatus = yield* call(
      getWalletInstanceStatus,
      env,
      integrityKeyTag,
      sessionToken
    );

    if (walletInstanceStatus.is_revoked) {
      trackItwWalletInstanceRevocation(walletInstanceStatus.revocation_reason);
      yield* call(handleWalletInstanceResetSaga);
    }

    // Update wallet instance status
    yield* put(itwUpdateWalletInstanceStatus.success(walletInstanceStatus));
  } catch (e) {
    trackItwStatusWalletAttestationFailure();
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
  // Before any check we need to ensure the integrity service is ready
  if (yield* call(checkIntegrityServiceReadySaga)) {
    const isItwOperationalOrValid = yield* select(
      itwLifecycleIsOperationalOrValid
    );
    const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);

    // Only operational or valid wallet instances can be revoked.
    if (isItwOperationalOrValid && O.isSome(integrityKeyTag)) {
      yield* call(getStatusOrResetWalletInstance, integrityKeyTag.value);
    }
  }
}

/**
 * Saga responsible for checking wallet instance inconsistency.
 * If an eID is present but the integrity key tag is missing,
 * the wallet instance is reset.
 */
export function* checkWalletInstanceInconsistencySaga(): Generator<
  ReduxSagaEffect,
  boolean
> {
  const eid = yield* select(itwCredentialsEidSelector);
  const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);

  if (O.isSome(eid) && O.isNone(integrityKeyTag)) {
    yield* call(handleWalletInstanceResetSaga);
    trackItwWalletBadState();
    return false;
  }

  return true;
}

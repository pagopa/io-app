import * as O from "fp-ts/lib/Option";
import { call, put, select } from "typed-redux-saga/macro";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { getNetworkError } from "../../../../utils/errors";
import { trackItwStatusWalletAttestationFailure } from "../../analytics";
import { getWalletInstanceStatus } from "../../common/utils/itwAttestationUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { handleWalletInstanceResetSaga } from "./handleWalletInstanceResetSaga";
import { checkIntegrityServiceReadySaga } from "./checkIntegrityServiceReadySaga";

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
    return false;
  }

  return true;
}

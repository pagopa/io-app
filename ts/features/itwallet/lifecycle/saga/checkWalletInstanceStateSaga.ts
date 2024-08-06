import { Errors } from "@pagopa/io-react-native-wallet";
import { call, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import { getAttestation } from "../../common/utils/itwAttestationUtils";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { ReduxSagaEffect } from "../../../../types/utils";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { assert } from "../../../../utils/assert";
import { handleWalletInstanceReset } from "./handleWalletInstanceResetSaga";

export function* getAttestationOrResetWalletInstance(integrityKeyTag: string) {
  const sessionToken = yield* select(sessionTokenSelector);

  assert(sessionToken, "Missing session token");

  try {
    yield* call(ensureIntegrityServiceIsReady);
    yield* call(getAttestation, integrityKeyTag, sessionToken);
  } catch (err) {
    if (
      err instanceof Errors.WalletInstanceRevokedError ||
      err instanceof Errors.WalletInstanceNotFoundError
    ) {
      yield* call(handleWalletInstanceReset);
    }
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
  const isItwOperationalOrValid = yield* select(
    itwLifecycleIsOperationalOrValid
  );
  const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);

  // Only operational or valid wallet instances can be revoked.
  if (isItwOperationalOrValid && O.isSome(integrityKeyTag)) {
    yield* call(getAttestationOrResetWalletInstance, integrityKeyTag.value);
  }
}

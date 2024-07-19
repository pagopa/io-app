import { Errors } from "@pagopa/io-react-native-wallet";
import { deleteKey } from "@pagopa/io-react-native-crypto";
import { call, put, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import { getAttestation } from "../../common/utils/itwAttestationUtils";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { ReduxSagaEffect } from "../../../../types/utils";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import { itwLifecycleWalletReset } from "../store/actions";
import { walletRemoveCardsByType } from "../../../newWallet/store/actions/cards";

export function* handleWalletInstanceReset(integrityKeyTag: string) {
  yield* put(itwLifecycleWalletReset());
  yield* put(walletRemoveCardsByType("itw"));
  yield* call(deleteKey, integrityKeyTag);
}

export function* getAttestationOrResetWalletInstance(integrityKeyTag: string) {
  try {
    yield* call(ensureIntegrityServiceIsReady);
    yield* call(getAttestation, integrityKeyTag);
  } catch (err) {
    if (
      err instanceof Errors.WalletInstanceRevokedError ||
      err instanceof Errors.WalletInstanceNotFoundError
    ) {
      yield* call(handleWalletInstanceReset, integrityKeyTag);
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

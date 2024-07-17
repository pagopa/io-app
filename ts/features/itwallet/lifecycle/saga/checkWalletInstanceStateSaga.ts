import { Errors } from "@pagopa/io-react-native-wallet";
import { deleteKey } from "@pagopa/io-react-native-crypto";
import { call, put, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import { getAttestation } from "../../common/utils/itwAttestationUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwRemoveIntegrityKeyTag } from "../../issuance/store/actions";
import { ReduxSagaEffect } from "../../../../types/utils";
import { itwLifecycleIsInstalledSelector } from "../store/selectors";
import { ItwLifecycleState } from "../store/reducers";
import { itwLifecycleStateUpdated } from "../store/actions";
import { itwCredentialsWalletReset } from "../../credentials/store/actions";

function* handleWalletInstanceReset(integrityKeyTag: string) {
  yield* call(deleteKey, integrityKeyTag);
  yield* put(itwRemoveIntegrityKeyTag());
  yield* put(itwCredentialsWalletReset());
  yield* put(
    itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_INSTALLED)
  );
}

/**
 * Get a wallet attestation to check whether
 * the wallet instance was revoked or does not exist at all.
 * If that happened, the wallet is reset.
 */
function* getAttestationOrResetWalletInstance(integrityKeyTag: string) {
  try {
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

export function* checkWalletInstanceStateSaga(): Generator<
  ReduxSagaEffect,
  void
> {
  const isItWalletInstalled = yield* select(itwLifecycleIsInstalledSelector);
  // No need to check the wallet state if it was never activated
  if (isItWalletInstalled) {
    return;
  }

  const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);
  if (O.isSome(integrityKeyTag)) {
    yield* call(getAttestationOrResetWalletInstance, integrityKeyTag.value);
  }
}

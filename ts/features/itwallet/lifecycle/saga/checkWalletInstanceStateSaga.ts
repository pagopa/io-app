import { Errors } from "@pagopa/io-react-native-wallet";
import { deleteKey } from "@pagopa/io-react-native-crypto";
import { all, call, put, select } from "typed-redux-saga/macro";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { getAttestation } from "../../common/utils/itwAttestationUtils";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { ReduxSagaEffect } from "../../../../types/utils";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import { itwLifecycleWalletReset } from "../store/actions";
import { walletRemoveCardsByType } from "../../../newWallet/store/actions/cards";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { assert } from "../../../../utils/assert";
import { itwCredentialsSelector } from "../../credentials/store/selectors";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

const getKeyTag = (credential: O.Option<StoredCredential>) =>
  pipe(
    credential,
    O.map(x => x.keyTag)
  );

export function* handleWalletInstanceReset(integrityKeyTag: string) {
  const { eid, credentials } = yield* select(itwCredentialsSelector);
  yield* put(itwLifecycleWalletReset());
  yield* put(walletRemoveCardsByType("itw"));

  // Remove all keys within the wallet
  const itwKeyTags = pipe(
    [O.of(integrityKeyTag), getKeyTag(eid), ...credentials.map(getKeyTag)],
    RA.filterMap(identity)
  );
  yield* all(itwKeyTags.map(deleteKey));
}

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

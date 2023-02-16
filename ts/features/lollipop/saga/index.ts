import * as O from "fp-ts/lib/Option";
import { v4 as uuid } from "uuid";
import { put, select } from "typed-redux-saga/macro";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import { lollipopKeyTagSave } from "../store/actions/lollipop";
import {
  cryptoKeyGenerationSaga,
  deletePreviousCryptoKeyPair
} from "../../../sagas/startup/generateCryptoKeyPair";
import { lollipopLoginEnabled } from "../../../config";

export function* generateLollipopKeySaga() {
  const maybeOldKeyTag = yield* select(lollipopKeyTagSelector);
  // Weather the user is logged in or not
  // we generate a key (if no one is present)
  // to have a key also for those users that update the app
  // and are already logged in.
  if (O.isNone(maybeOldKeyTag)) {
    const newKeyTag = uuid();
    yield* put(lollipopKeyTagSave({ keyTag: newKeyTag }));
    yield* cryptoKeyGenerationSaga(newKeyTag, maybeOldKeyTag);
    if (!lollipopLoginEnabled) {
      // If the lollipop login is not enable we immediately delete
      // the new generated key.
      yield* deletePreviousCryptoKeyPair(O.some(newKeyTag));
    }
  }
}

export function* deleteCurrentLollipopKeyAndGenerateNewKeyTag() {
  const maybeCurrentKeyTag = yield* select(lollipopKeyTagSelector);
  yield* deletePreviousCryptoKeyPair(maybeCurrentKeyTag);
  const newKeyTag = uuid();
  yield* put(lollipopKeyTagSave({ keyTag: newKeyTag }));
}

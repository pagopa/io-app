import * as O from "fp-ts/lib/Option";
import { v4 as uuid } from "uuid";
import { put, select, call } from "typed-redux-saga/macro";
import { getPublicKey } from "@pagopa/io-react-native-crypto";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import { lollipopKeyTagSave } from "../store/actions/lollipop";
import {
  cryptoKeyGenerationSaga,
  deletePreviousCryptoKeyPair
} from "../../../sagas/startup/generateCryptoKeyPair";

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
  } else {
    try {
      // If we already have a keyTag, we check if there is
      // a public key tied with it.
      yield* call(getPublicKey, maybeOldKeyTag.value);
    } catch {
      // If there is no key it could be for two reasons:
      // - The user have a recent app and they logged out (the key is deleted).
      // - The user is logged in and is updating from an app version
      //    that didn't manage the key generation.
      // Having a key or an error in those cases is useful to show
      // the user an informative banner saying that their device
      // is not suitable for future version of IO.
      yield* cryptoKeyGenerationSaga(maybeOldKeyTag.value, O.none);
    }
  }
}

export function* deleteCurrentLollipopKeyAndGenerateNewKeyTag() {
  const maybeCurrentKeyTag = yield* select(lollipopKeyTagSelector);
  yield* deletePreviousCryptoKeyPair(maybeCurrentKeyTag);
  const newKeyTag = uuid();
  yield* put(lollipopKeyTagSave({ keyTag: newKeyTag }));
}

import * as O from "fp-ts/lib/Option";
import { v4 as uuid } from "uuid";
import { put, select, call } from "typed-redux-saga/macro";
import { getPublicKey } from "@pagopa/io-react-native-crypto";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import {
  lollipopKeyTagSave,
  lollipopSetPublicKey
} from "../store/actions/lollipop";
import {
  cryptoKeyGenerationSaga,
  deletePreviousCryptoKeyPair
} from "../../../sagas/startup/generateCryptoKeyPair";
import { sessionInfoSelector } from "../../../store/reducers/authentication";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER
} from "../utils/login";
import { startApplicationInitialization } from "../../../store/actions/application";
import { sessionInvalid } from "../../../store/actions/authentication";
import { clearCache } from "../../../store/actions/profile";
import { resetAssistanceData } from "../../../utils/supportAssistance";
import { jwkThumbprintByEncoding } from "jwk-thumbprint";
import { pipe } from "fp-ts/lib/function";

export function* generateLollipopKeySaga() {
  const maybeOldKeyTag = yield* select(lollipopKeyTagSelector);
  // Weather the user is logged in or not
  // we generate a key (if no one is present)
  // to have a key also for those users that update the app
  // and are already logged in.
  if (O.isNone(maybeOldKeyTag)) {
    const newKeyTag = uuid();
    yield* put(lollipopKeyTagSave({ keyTag: newKeyTag }));
    yield* call(cryptoKeyGenerationSaga, newKeyTag, maybeOldKeyTag);
  } else {
    try {
      // If we already have a keyTag, we check if there is
      // a public key tied with it.
      const publicKey = yield* call(getPublicKey, maybeOldKeyTag.value);
      yield* put(lollipopSetPublicKey({ publicKey }));
    } catch {
      // If there is no key it could be for two reasons:
      // - The user have a recent app and they logged out (the key is deleted).
      // - The user is logged in and is updating from an app version
      //    that didn't manage the key generation.
      // Having a key or an error in those cases is useful to show
      // the user an informative banner saying that their device
      // is not suitable for future version of IO.
      yield* call(cryptoKeyGenerationSaga, maybeOldKeyTag.value, O.none);
    }
  }
}

export function* deleteCurrentLollipopKeyAndGenerateNewKeyTag() {
  const maybeCurrentKeyTag = yield* select(lollipopKeyTagSelector);
  yield* call(deletePreviousCryptoKeyPair, maybeCurrentKeyTag);
  const newKeyTag = uuid();
  yield* put(lollipopKeyTagSave({ keyTag: newKeyTag }));
}

export function* lollipopKeyCheckWithServer() {
  const maybeSessionInformation: ReturnType<typeof sessionInfoSelector> =
    yield* select(sessionInfoSelector);

  const publicKey: ReturnType<typeof lollipopPublicKeySelector> = yield* select(
    lollipopPublicKeySelector
  );

  if (O.isSome(maybeSessionInformation)) {
    const lollipop_assertion_ref =
      maybeSessionInformation.value.lollipop_assertion_ref;
    let localAssertionRef = undefined;

    if (O.isSome(publicKey)) {
      const converted = jwkThumbprintByEncoding(
        publicKey.value,
        DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
        "base64url"
      );
      localAssertionRef = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${converted}`;
    }

    if (!lollipop_assertion_ref || lollipop_assertion_ref !== localAssertionRef) {
      yield* put(sessionInvalid());
      resetAssistanceData();
      yield* put(clearCache());
      yield* put(startApplicationInitialization());
      return;
    }
  }
}


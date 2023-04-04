import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { v4 as uuid } from "uuid";
import { put, select, call } from "typed-redux-saga/macro";
import {
  deleteKey,
  generate,
  getPublicKey,
  PublicKey
} from "@pagopa/io-react-native-crypto";
import { jwkThumbprintByEncoding } from "jwk-thumbprint";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import {
  lollipopKeyTagSave,
  lollipopRemovePublicKey,
  lollipopSetPublicKey
} from "../store/actions/lollipop";
import { KeyInfo, toCryptoError } from "../utils/crypto";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER
} from "../utils/login";
import { sessionInvalid } from "../../../store/actions/authentication";
import { restartCleanApplication } from "../../../sagas/commons";

import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import {
  trackLollipopKeyGenerationFailure,
  trackLollipopKeyGenerationSuccess
} from "../../../utils/analytics";
import { PublicSession } from "../../../../definitions/backend/PublicSession";
import { identityProviderSelector } from "../../../store/reducers/authentication";

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

export function* checkLollipopSessionAssertionAndInvalidateIfNeeded(
  maybePublicKey: O.Option<PublicKey>,
  maybeSessionInformation: O.Option<PublicSession>
) {
  // When using the test idp to login, no authentication data nor lollipop key are saved / used / sent.
  // Therefore, we must not check for the lollipop assertion,
  // when this function is called after a successful test idp login,
  // otherwise the (test) user is immediately logged-out.
  // TODO: this is a temporary workaround, we should find a better way to handle test accounts.
  // See: https://pagopa.atlassian.net/browse/LLK-72
  const areWeLoggedWithTestIdp = yield* select(identityProviderSelector);
  if (areWeLoggedWithTestIdp?.isTestIdp) {
    return;
  }

  const lollipopCheckResult = pipe(
    maybeSessionInformation,
    O.chainNullableK(
      sessionInformation => sessionInformation.lollipopAssertionRef
    ),
    O.chain(sessionLollipopAssertionRef =>
      pipe(
        maybePublicKey,
        O.map(publicKey =>
          pipe(
            jwkThumbprintByEncoding(
              publicKey,
              DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
              "base64url"
            ),
            publicKeyThumbprint =>
              `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${publicKeyThumbprint}`,
            localLollipopAssertionRef =>
              localLollipopAssertionRef === sessionLollipopAssertionRef
          )
        )
      )
    ),
    O.getOrElse(() => false)
  );

  if (!lollipopCheckResult) {
    yield* put(sessionInvalid());
    yield* call(restartCleanApplication);
  }
}
/**
 * Generates a new crypto key pair.
 */
function* cryptoKeyGenerationSaga(
  keyTag: string,
  previousKeyTag: O.Option<string>
) {
  // Every new login we need to regenerate a brand new key pair.
  yield* call(deletePreviousCryptoKeyPair, previousKeyTag);
  yield* call(generateCryptoKeyPair, keyTag);
}

/**
 * Deletes a previous saved crypto key pair.
 */
function* deletePreviousCryptoKeyPair(keyTag: O.Option<string>) {
  if (O.isSome(keyTag)) {
    yield* call(deleteCryptoKeyPair, keyTag.value);
  }
}

/**
 * Deletes the crypto key pair corresponding to the provided `keyTag`.
 */
function* deleteCryptoKeyPair(keyTag: string) {
  // Key is persisted even after uninstalling the application on iOS.
  const keyAlreadyExistsOnKeystore = yield* call(checkPublicKeyExists, keyTag);

  if (keyAlreadyExistsOnKeystore) {
    try {
      yield* call(deleteKey, keyTag);
      yield* put(lollipopRemovePublicKey());
    } catch (e) {
      const mixPanelEnabled = yield* select(isMixpanelEnabled);
      if (mixPanelEnabled) {
        const { message } = toCryptoError(e);
        yield* call(trackLollipopKeyGenerationFailure, message);
      }
    }
  }
}

const checkPublicKeyExists = (keyTag: string) =>
  pipe(
    TE.tryCatch(
      () => getPublicKey(keyTag),
      () => false
    ),
    TE.map(_ => true),
    TE.getOrElse(() => T.of(false))
  )();

/**
 * Generates a new crypto key pair.
 */
function* generateCryptoKeyPair(keyTag: string) {
  try {
    // Remove an already existing key with the same tag.
    yield* call(deleteCryptoKeyPair, keyTag);

    const publicKey = yield* call(generate, keyTag);
    yield* put(lollipopSetPublicKey({ publicKey }));
    const mixPanelEnabled = yield* select(isMixpanelEnabled);
    if (mixPanelEnabled) {
      yield* call(trackLollipopKeyGenerationSuccess, publicKey.kty);
    }
  } catch (e) {
    const mixPanelEnabled = yield* select(isMixpanelEnabled);
    if (mixPanelEnabled) {
      const { message } = toCryptoError(e);
      yield* call(trackLollipopKeyGenerationFailure, message);
    }
  }
}

export const generateKeyInfo = (
  maybeKeyTag: O.Option<string>,
  maybePublicKey: O.Option<PublicKey>
) =>
  pipe(
    maybeKeyTag,
    O.chain(keyTag =>
      pipe(
        maybePublicKey,
        O.map(publicKey => keyInfoFromKeyTagAndPublicKey(keyTag, publicKey))
      )
    ),
    O.getOrElse(defaultKeyInfo)
  );

const keyInfoFromKeyTagAndPublicKey = (
  keyTag: string,
  publicKey: PublicKey
): KeyInfo => ({
  keyTag,
  publicKey,
  publicKeyThumbprint: jwkThumbprintByEncoding(
    publicKey,
    DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
    "base64url"
  )
});

const defaultKeyInfo = (): KeyInfo => ({
  keyTag: undefined,
  publicKey: undefined,
  publicKeyThumbprint: undefined
});

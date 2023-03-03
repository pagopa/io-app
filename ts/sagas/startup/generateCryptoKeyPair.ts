import * as O from "fp-ts/lib/Option";
import {
  generate,
  CryptoError,
  deleteKey
} from "@pagopa/io-react-native-crypto";
import { call } from "typed-redux-saga/macro";
import {
  checkPublicKeyExists,
  setKeyGenerationInfo,
  getKeyGenerationInfo,
  KeyGenerationInfo
} from "../../utils/crypto";
import {
  trackLollipopKeyGenerationFailure,
  trackLollipopKeyGenerationSuccess
} from "../../utils/analytics";

/**
 * Generates a new crypto key pair.
 */
export function* cryptoKeyGenerationSaga(
  keyTag: string,
  previousKeyTag: O.Option<string>
) {
  // Every new login we need to regenerate a brand new key pair.
  yield* deletePreviousCryptoKeyPair(previousKeyTag);
  yield* call(generateCryptoKeyPair, keyTag);
}

/**
 * Sends to mixpanel the crypto key pair generation events.
 */
export function* trackMixpanelCryptoKeyPairEvents(keyTag: string) {
  const keyInfo = yield* call(getKeyGenerationInfo, keyTag);

  if (!keyInfo) {
    return;
  }

  if (keyInfo.errorCode) {
    trackLollipopKeyGenerationFailure(keyInfo);
    return;
  }

  trackLollipopKeyGenerationSuccess(keyInfo);
}

/**
 * Deletes a previous saved crypto key pair.
 */
export function* deletePreviousCryptoKeyPair(keyTag: O.Option<string>) {
  if (O.isSome(keyTag)) {
    yield* deleteCryptoKeyPair(keyTag.value);
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
    } catch (e) {
      yield* saveKeyGenerationFailureInfo(keyTag, e);
    }
  }
}

/**
 * Generates a new crypto key pair.
 */
function* generateCryptoKeyPair(keyTag: string) {
  try {
    // Remove an already existing key with the same tag.
    deleteCryptoKeyPair(keyTag);

    const key = yield* call(generate, keyTag);
    const keyGenerationInfo: KeyGenerationInfo = {
      keyTag,
      keyType: key.kty
    };
    yield* call(setKeyGenerationInfo, keyTag, keyGenerationInfo);
  } catch (e) {
    yield* saveKeyGenerationFailureInfo(keyTag, e);
  }
}

/**
 * Persists the crypto key pair generation information data.
 */
function* saveKeyGenerationFailureInfo(keyTag: string, e: unknown) {
  const { message: errorCode } = e as CryptoError;
  const keyGenerationInfo: KeyGenerationInfo = {
    keyTag,
    errorCode
  };
  yield* call(setKeyGenerationInfo, keyTag, keyGenerationInfo);
}

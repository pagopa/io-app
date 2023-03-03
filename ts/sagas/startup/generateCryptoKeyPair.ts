import * as O from "fp-ts/lib/Option";
import {
  generate,
  CryptoError,
  deleteKey,
  getPublicKey
} from "@pagopa/io-react-native-crypto";
import { call } from "typed-redux-saga/macro";
import { jwkThumbprintByEncoding } from "jwk-thumbprint";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT } from "../../features/lollipop/utils/login";
import {
  checkPublicKeyExists,
  setKeyGenerationInfo,
  getKeyGenerationInfo,
  KeyGenerationInfo,
  KeyInfo
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
  yield* call(deletePreviousCryptoKeyPair, previousKeyTag);
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
    yield* call(deleteCryptoKeyPair, keyTag);

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
 * Get the public key tied to the provided keyTag
 */
export function* getCryptoPublicKey(keyTag: O.Option<string>) {
  const emptyKeyInfo: KeyInfo = {
    keyTag: undefined,
    publicKey: undefined
  };
  try {
    if (O.isSome(keyTag)) {
      const publicKey = yield* call(getPublicKey, keyTag.value);
      const keyInfo: KeyInfo = {
        keyTag: keyTag.value,
        publicKey,
        publicKeyThumbprint: jwkThumbprintByEncoding(
          publicKey,
          DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
          "base64url"
        )
      };
      return keyInfo;
    } else {
      return emptyKeyInfo;
    }
  } catch (e) {
    return emptyKeyInfo;
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

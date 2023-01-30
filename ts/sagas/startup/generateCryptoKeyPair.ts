import {
  generate,
  CryptoError,
  deleteKey
} from "@pagopa/io-react-native-crypto";
import { call, select } from "typed-redux-saga/macro";
import { isLollipopEnabledSelector } from "../../store/reducers/backendStatus";
import {
  checkPublicKeyExists,
  setKeyGenerationInfo,
  getKeyGenerationInfo,
  KeyGenerationInfo
} from "../../utils/crypto";
import { mixpanelTrack } from "./../../mixpanel";
import { lollipopSelector } from "./../../store/actions/lollipop";

/**
 * Generates a new crypto key pair.
 */
export function* cryptoKeyGenerationSaga(keyTag: string) {
  const isLollipopEnabled = yield* select(isLollipopEnabledSelector);
  if (isLollipopEnabled) {
    yield* deletePreviousCryptoKeyPair();
    yield* call(generateCryptoKeyPair, keyTag);
  }
}

/**
 * Sends to mixpanel the crypto key pair generation events.
 */
export function* trackMixpanelCryptoKeyPairEvents(keyTag: string) {
  const keyInfo = yield* call(getKeyGenerationInfo, keyTag);

  if (keyInfo && !keyInfo.errorCode) {
    void mixpanelTrack("LOLLIPOP_KEY_GENERATION_SUCCESS", {
      kty: keyInfo.keyType
    });
  }

  if (keyInfo && keyInfo.errorCode) {
    void mixpanelTrack("LOLLIPOP_KEY_GENERATION_FAILURE", {
      reason: keyInfo.errorCode,
      resonMoreInfo: keyInfo.userInfo
    });
  }
}

/**
 * Deletes a previous save crypto key pair.
 */
export function* deletePreviousCryptoKeyPair() {
  const maybeOldKeyTag = (yield* select(lollipopSelector)).keyTag;
  if (maybeOldKeyTag) {
    yield* deleteCryptoKeyPair(maybeOldKeyTag);
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
      // We couldn't proceed eny further.
      return;
    }
  }
}

/**
 * Generates a new crypto key pair.
 */
function* generateCryptoKeyPair(keyTag: string) {
  try {
    // Every new fresh login we need to regenerate a new key pair.
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
  const { message: errorCode, userInfo } = e as CryptoError;
  const keyGenerationInfo: KeyGenerationInfo = {
    keyTag,
    errorCode,
    userInfo
  };
  yield* call(setKeyGenerationInfo, keyTag, keyGenerationInfo);
}

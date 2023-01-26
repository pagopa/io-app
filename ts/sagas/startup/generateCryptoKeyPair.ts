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

const KEY_NAME = "lp-key";

export function* cryptoKeyGenerationSaga() {
  const isLollipopEnabled = yield* select(isLollipopEnabledSelector);
  if (isLollipopEnabled) {
    yield* call(generateCryptoKeyPair);
  }
}

export function* trackMixpanelCryptoKeyPairEvents() {
  const keyInfo = yield* call(getKeyGenerationInfo, KEY_NAME);

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

function* generateCryptoKeyPair() {
  try {
    // Key is persisted even after uninstalling the application.
    const keyAlreadyExistsOnKeystore = yield* call(
      checkPublicKeyExists,
      KEY_NAME
    );

    // Every new fresh login we need to regenerate a new key pair.
    if (keyAlreadyExistsOnKeystore) {
      try {
        yield* call(deleteKey, KEY_NAME);
      } catch (e) {
        yield* saveKeyGenerationFailureInfo(e);
        // We couldn't proceed eny further.
        // If we proceed any further.
        return;
      }
    }

    const key = yield* call(generate, KEY_NAME);
    const keyGenerationInfo: KeyGenerationInfo = {
      keyTag: KEY_NAME,
      keyType: key.kty
    };
    yield* call(setKeyGenerationInfo, KEY_NAME, keyGenerationInfo);
  } catch (e) {
    yield* saveKeyGenerationFailureInfo(e);
  }
}

function* saveKeyGenerationFailureInfo(e: unknown) {
  const { message: errorCode, userInfo } = e as CryptoError;
  const keyGenerationInfo: KeyGenerationInfo = {
    keyTag: KEY_NAME,
    errorCode,
    userInfo
  };
  yield* call(setKeyGenerationInfo, KEY_NAME, keyGenerationInfo);
}

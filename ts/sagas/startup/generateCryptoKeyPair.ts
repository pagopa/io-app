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

export function* cryptoKeyGenerationSaga(keyTag: string) {
  const isLollipopEnabled = yield* select(isLollipopEnabledSelector);
  if (isLollipopEnabled) {
    yield* call(generateCryptoKeyPair, keyTag);
  }
}

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

function* generateCryptoKeyPair(keyTag: string) {
  try {
    // Key is persisted even after uninstalling the application.
    const keyAlreadyExistsOnKeystore = yield* call(
      checkPublicKeyExists,
      keyTag
    );

    // Every new fresh login we need to regenerate a new key pair.
    if (keyAlreadyExistsOnKeystore) {
      try {
        yield* call(deleteKey, keyTag);
      } catch (e) {
        yield* saveKeyGenerationFailureInfo(keyTag, e);
        // We couldn't proceed eny further.
        return;
      }
    }

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

function* saveKeyGenerationFailureInfo(keyTag: string, e: unknown) {
  const { message: errorCode, userInfo } = e as CryptoError;
  const keyGenerationInfo: KeyGenerationInfo = {
    keyTag,
    errorCode,
    userInfo
  };
  yield* call(setKeyGenerationInfo, keyTag, keyGenerationInfo);
}

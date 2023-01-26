import { generate, CryptoError } from "@pagopa/io-react-native-crypto";
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
    const keyAlreadyExistsOnKeystore = yield* call(
      checkPublicKeyExists,
      KEY_NAME
    );

    const shouldWeGenerateKey = !keyAlreadyExistsOnKeystore;
    if (shouldWeGenerateKey) {
      const key = yield* call(generate, KEY_NAME);
      const keyGenerationInfo: KeyGenerationInfo = {
        keyTag: KEY_NAME,
        keyType: key.kty
      };
      yield* call(setKeyGenerationInfo, KEY_NAME, keyGenerationInfo);
    }
  } catch (e) {
    const { message: errorCode, userInfo } = e as CryptoError;
    const keyGenerationInfo: KeyGenerationInfo = {
      keyTag: KEY_NAME,
      errorCode,
      userInfo
    };
    yield* call(setKeyGenerationInfo, KEY_NAME, keyGenerationInfo);
  }
}

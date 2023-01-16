import {
  generate,
  deleteKey,
  CryptoError
} from "@pagopa/io-react-native-crypto";
import { call } from "typed-redux-saga/macro";
import {
  checkPublicKeyExists,
  isKeyAlreadyGenerated,
  setKeyAlreadyGenerated
} from "../../utils/crypto";
import { mixpanelTrack } from "./../../mixpanel";

const KEY_NAME = "lp-temp-key";

export function* generateCryptoKeyPair() {
  try {
    const keyAlreadyExistsOnKeystore = yield* call(
      checkPublicKeyExists,
      KEY_NAME
    );
    const keyHasBeenAlreadyGenerated = yield* call(
      isKeyAlreadyGenerated,
      KEY_NAME
    );
    const shouldWeGenerateKey = !(
      keyHasBeenAlreadyGenerated || keyAlreadyExistsOnKeystore
    );

    if (shouldWeGenerateKey) {
      const key = yield* call(generate, KEY_NAME);
      void mixpanelTrack("LOLLIPOP_KEY_GENERATION_SUCCESS", {
        kty: key.kty
      });
      yield* call(setKeyAlreadyGenerated, KEY_NAME, key.kty);
      yield* call(deleteKey, KEY_NAME);
    }
  } catch (e) {
    const errorMessage = (e as CryptoError).message;
    void mixpanelTrack("LOLLIPOP_KEY_GENERATION_FAILURE", {
      reason: errorMessage
    });
  }
}

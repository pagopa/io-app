import { mixpanelTrack } from "./../../mixpanel";
import { generate, deleteKey, CryptoError } from "io-react-native-crypto";
import { call } from "typed-redux-saga/macro";
import {
  checkPublicKeyExists,
  isKeyAlreadyGenerated,
  setKeyAlreadyGenerated
} from "../../utils/crypto";

const KEY_NAME = "lp-temp-key";

export function* generateCryptoKeyPair() {
  try {
    const keyExistsOnKeystore = yield* call(checkPublicKeyExists, KEY_NAME);
    const keyAlreadyExists = yield* call(isKeyAlreadyGenerated, KEY_NAME);
    const generateKey = !(keyAlreadyExists || keyExistsOnKeystore);

    if (generateKey) {
      const key = yield* call(generate, KEY_NAME);
      void mixpanelTrack("LOLLIPOP_KEY_GENERATION_SUCCESS");
      yield* call(setKeyAlreadyGenerated, KEY_NAME, key.kty);
      yield* call(deleteKey, KEY_NAME);
    }
  } catch (e) {
    const errorMessage = (e as CryptoError).message;
    void mixpanelTrack("LOLLIPOP_KEY_GENERATION_FAILURE", {
      reason: errorMessage
    });
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

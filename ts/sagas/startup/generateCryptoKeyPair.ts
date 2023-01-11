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
    const keyAlreadtExists = yield* call(isKeyAlreadyGenerated, KEY_NAME);
    const generateKey = !(keyAlreadtExists || keyExistsOnKeystore);

    if (generateKey) {
      const key = yield* call(generate, KEY_NAME);
      const keyGenarationSavedOnLocalStorage = yield* call(
        setKeyAlreadyGenerated,
        KEY_NAME,
        key.kty
      );
      if (keyGenarationSavedOnLocalStorage) {
        deleteKey(KEY_NAME).catch((_: CryptoError) => {
          // TODO: add mixpanel event: KO on key deletion?
        });
      }
      // TODO: add mixpane event: OK
    }
  } catch (e) {
    // TODO: add mixpanel event: KO
    const errorMessage = (e as CryptoError).message;
    if (errorMessage) {
      // This is a CryptoError
    }
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

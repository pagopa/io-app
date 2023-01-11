import { generate } from "io-react-native-crypto";
import { call } from "typed-redux-saga/macro";
import { checkPublicKeyExists } from "../../utils/crypto";

const KEY_NAME = "lp-temp-key";

export function* generateAndSign() {
  try {
    const keyExistsRes = yield* call(checkPublicKeyExists, KEY_NAME);

    if (!keyExistsRes) {
      yield* call(generate, KEY_NAME);
      // TODO: add mixpane event: OK
    }
  } catch (e) {
    // TODO: add mixpanel event: KO
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

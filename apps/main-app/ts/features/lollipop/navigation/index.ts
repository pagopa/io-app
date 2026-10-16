import { put, select } from "typed-redux-saga/macro";

import { lollipopSetSupportedDevice } from "../store/actions/lollipop";
import { lollipopPublicKeySelector } from "../store/reducers/lollipop";

export function* checkPublicKeyAndBlockIfNeeded() {
  const publicKey = yield* select(lollipopPublicKeySelector);
  if (publicKey == null) {
    yield* put(lollipopSetSupportedDevice(false));
    return true;
  }
  return false;
}

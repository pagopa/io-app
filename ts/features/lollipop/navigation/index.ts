import * as O from "fp-ts/lib/Option";
import { put, select } from "typed-redux-saga/macro";
import { lollipopSetSupportedDevice } from "../store/actions/lollipop";
import { lollipopPublicKeySelector } from "../store/reducers/lollipop";
import { mixpanelTrack } from "../../../mixpanel";

export function* checkPublicKeyAndBlockIfNeeded() {
  const publicKey = yield* select(lollipopPublicKeySelector);
  if (O.isNone(publicKey)) {
    mixpanelTrack("PUBLIC_KEY_IS_NONE");
    yield* put(lollipopSetSupportedDevice(false));
    return true;
  }
  mixpanelTrack("PUBLIC_KEY_IS_SOME", {
    publicKey: JSON.stringify(publicKey.value)
  });
  return false;
}

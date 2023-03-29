import * as O from "fp-ts/lib/Option";
import { select } from "typed-redux-saga/macro";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { lollipopPublicKeySelector } from "../store/reducers/lollipop";

export function* getPublicKeyAndBlockIfNeeded() {
  const publicKey = yield* select(lollipopPublicKeySelector);
  if (O.isNone(publicKey)) {
    NavigationService.navigate(ROUTES.UNSUPPORTED_DEVICE, {
      screen: ROUTES.UNSUPPORTED_DEVICE
    });
    return true;
  } else {
    return false;
  }
}

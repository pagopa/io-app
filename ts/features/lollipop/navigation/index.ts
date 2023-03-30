import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { select } from "typed-redux-saga/macro";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { lollipopPublicKeySelector } from "../store/reducers/lollipop";

export function* checkPublicKeyAndBlockIfNeeded() {
  const publicKey = yield* select(lollipopPublicKeySelector);
  return pipe(
    publicKey,
    O.fold(
      () => {
        NavigationService.navigate(ROUTES.UNSUPPORTED_DEVICE, {
          screen: ROUTES.UNSUPPORTED_DEVICE
        });
        return true;
      },
      _ => false
    )
  );
}

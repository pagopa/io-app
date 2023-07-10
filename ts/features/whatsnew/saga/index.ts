import { select } from "typed-redux-saga/macro";
import { whatsNewSelector } from "../store/reducers";

function* whatsNewSaga() {
  const whatsNew = yield* select(whatsNewSelector);
  const lastVisualizedVersion = whatsNew.lastVisualizedVersion;
}

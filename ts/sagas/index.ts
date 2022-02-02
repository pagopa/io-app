/**
 * The root saga that forks and includes all the other sagas.
 */
import { all, call } from "typed-redux-saga";

import backendInfoSaga from "./backendInfo";
import backendStatusSaga from "./backendStatus";
import { watchContentSaga } from "./contentLoaders";
import unreadInstabugMessagesSaga from "./instabug";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";

import {
  watchBackToEntrypointPaymentSaga,
  watchPaymentInitializeSaga
} from "./wallet";
import { watchNavigateToDeepLinkSaga } from "./watchNavigateToDeepLinkSaga";

export default function* root() {
  yield* all([
    call(startupSaga),
    call(backendStatusSaga),
    call(backendInfoSaga),
    call(unreadInstabugMessagesSaga),
    call(watchNavigateToDeepLinkSaga),
    call(loadSystemPreferencesSaga),
    call(watchContentSaga),
    call(watchPaymentInitializeSaga),
    call(watchBackToEntrypointPaymentSaga)
  ]);
}

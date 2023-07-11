/**
 * The root saga that forks and includes all the other sagas.
 */
import { all, call } from "typed-redux-saga/macro";
import versionInfoSaga from "../common/versionInfo/saga/versionInfo";
import { watchTokenRefreshSaga } from "../features/fastLogin/saga/tokenRefreshSaga";
import { watchPendingActionsSaga } from "../features/fastLogin/saga/pendingActionsSaga";
import backendStatusSaga from "./backendStatus";
import { watchContentSaga } from "./contentLoaders";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";
import { removePersistedStatesSaga } from "./removePersistedStates";

import {
  watchBackToEntrypointPaymentSaga,
  watchPaymentInitializeSaga
} from "./wallet";
import { watchIdentification } from "./identification";

export default function* root() {
  yield* all([
    call(watchIdentification),
    call(startupSaga),
    call(backendStatusSaga),
    call(versionInfoSaga),
    call(loadSystemPreferencesSaga),
    call(removePersistedStatesSaga),
    call(watchContentSaga),
    call(watchPaymentInitializeSaga),
    call(watchBackToEntrypointPaymentSaga),
    call(watchTokenRefreshSaga),
    call(watchPendingActionsSaga)
  ]);
}

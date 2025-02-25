/**
 * The root saga that forks and includes all the other sagas.
 */
import { all, call } from "typed-redux-saga/macro";
import versionInfoSaga from "../common/versionInfo/saga/versionInfo";
import { watchTokenRefreshSaga } from "../features/fastLogin/saga/tokenRefreshSaga";
import { watchPendingActionsSaga } from "../features/fastLogin/saga/pendingActionsSaga";
import { watchZendeskSupportSaga } from "../features/zendesk/saga";
import { zendeskEnabled } from "../config";
import connectivityStatusSaga from "../features/connectivity/saga";
import backendStatusSaga from "./backendStatus";
import { watchContentSaga } from "./contentLoaders";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";
import { removePersistedStatesSaga } from "./removePersistedStates";

import { watchIdentification } from "./identification";
import { watchApplicationActivitySaga } from "./startup/watchApplicationActivitySaga";

export default function* root() {
  yield* all([
    call(watchIdentification),
    call(watchApplicationActivitySaga),
    call(startupSaga),
    call(backendStatusSaga),
    call(connectivityStatusSaga),
    call(versionInfoSaga),
    call(loadSystemPreferencesSaga),
    call(removePersistedStatesSaga),
    call(watchContentSaga),
    call(watchTokenRefreshSaga),
    call(watchPendingActionsSaga),
    zendeskEnabled ? call(watchZendeskSupportSaga) : undefined
  ]);
}

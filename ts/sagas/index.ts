/**
 * The root saga that forks and includes all the other sagas.
 */
import { all, call } from "typed-redux-saga/macro";
import versionInfoSaga from "../common/versionInfo/saga/versionInfo";
import { watchTokenRefreshSaga } from "../features/authentication/fastLogin/saga/tokenRefreshSaga";
import { watchPendingActionsSaga } from "../features/authentication/fastLogin/saga/pendingActionsSaga";
import { watchZendeskSupportSaga } from "../features/zendesk/saga";
import { zendeskEnabled } from "../config";
import { watchUtmLinkSaga } from "../features/utmLink/saga";
import connectivityStatusSaga from "../features/connectivity/saga";
import { watchIdentification } from "../features/identification/sagas";
import { watchLogoutSaga } from "../features/authentication/common/saga/watchLogoutSaga";
import { watchMessagesSaga } from "../features/messages/saga";
import backendStatusSaga from "./backendStatus";
import { watchContentSaga } from "./contentLoaders";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";
import { removePersistedStatesSaga } from "./removePersistedStates";

import { watchApplicationActivitySaga } from "./startup/watchApplicationActivitySaga";

export default function* root() {
  yield* all([
    call(watchIdentification),
    call(watchApplicationActivitySaga),
    call(startupSaga),
    call(watchMessagesSaga),
    call(backendStatusSaga),
    call(connectivityStatusSaga),
    call(versionInfoSaga),
    call(loadSystemPreferencesSaga),
    call(removePersistedStatesSaga),
    call(watchContentSaga),
    call(watchTokenRefreshSaga),
    call(watchPendingActionsSaga),
    call(watchUtmLinkSaga),
    call(watchLogoutSaga),
    zendeskEnabled ? call(watchZendeskSupportSaga) : undefined
  ]);
}

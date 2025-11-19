/**
 * The root saga that forks and includes all the other sagas.
 */
import { all, call } from "typed-redux-saga/macro";
import versionInfoSaga from "../common/versionInfo/saga/versionInfo";
import { zendeskEnabled } from "../config";
import { watchLogoutSaga } from "../features/authentication/common/saga/watchLogoutSaga";
import { watchPendingActionsSaga } from "../features/authentication/fastLogin/saga/pendingActionsSaga";
import { watchTokenRefreshSaga } from "../features/authentication/fastLogin/saga/tokenRefreshSaga";
import connectivityStatusSaga from "../features/connectivity/saga";
import { watchIdentification } from "../features/identification/sagas";
import { watchUtmLinkSaga } from "../features/utmLink/saga";
import { watchWalletSaga } from "../features/wallet/saga";
import { watchExternalWalletUpdateSaga } from "../features/wallet/saga/watchExternalWalletUpdateSaga";
import { watchZendeskSupportSaga } from "../features/zendesk/saga";
import backendStatusSaga from "./backendStatus";
import { watchContentSaga } from "./contentLoaders";
import { loadSystemPreferencesSaga } from "./preferences";
import { removePersistedStatesSaga } from "./removePersistedStates";
import { startupSaga } from "./startup";
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
    call(watchUtmLinkSaga),
    call(watchLogoutSaga),
    call(watchWalletSaga),
    call(watchExternalWalletUpdateSaga),
    zendeskEnabled ? call(watchZendeskSupportSaga) : undefined
  ]);
}

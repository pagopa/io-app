/**
 * The root saga that forks and includes all the other sagas.
 */
import { all, call, Effect } from "redux-saga/effects";

import backendInfoSaga from "./backendInfo";
import backendStatusSaga from "./backendStatus";
import {
  watchContentMunicipalityLoadSaga,
  watchContentServicesByScopeLoad,
  watchServiceMetadataLoadSaga
} from "./contentLoaders";
import unreadInstabugMessagesSaga from "./instabug";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";

import {
  watchBackToEntrypointPaymentSaga,
  watchPaymentInitializeSaga
} from "./wallet";
import { watchForceLogout } from "./watchForceLogout";
import { watchNavigateToDeepLinkSaga } from "./watchNavigateToDeepLinkSaga";

// Parameters used by the withNetworkConnectivity HOC of react-native-offline.
// We use `withRedux: true` to store the network status in the redux store.
// More info at https://github.com/rauliyohmc/react-native-offline#withnetworkconnectivity
/* 
import { apiUrlPrefix } from "../config";
const connectionMonitorParameters = {
  withRedux: true,
  pingTimeout: 3000,
  pingServerUrl: `${apiUrlPrefix}/ping`, // PING endpoint of the app backend
  shouldPing: true,
  pingInterval: 30000
};
*/

export default function* root(): Iterator<Effect> {
  yield all([
    call(startupSaga),
    // this saga is temporary removed since it seems to not work properly
    // TODO https://www.pivotaltracker.com/story/show/171597422
    // call(networkSaga, connectionMonitorParameters),
    call(backendStatusSaga),
    call(backendInfoSaga),
    call(unreadInstabugMessagesSaga),
    call(watchNavigateToDeepLinkSaga),
    call(loadSystemPreferencesSaga),
    call(watchServiceMetadataLoadSaga),
    call(watchContentMunicipalityLoadSaga),
    call(watchContentServicesByScopeLoad),
    call(watchPaymentInitializeSaga),
    call(watchBackToEntrypointPaymentSaga),
    call(watchForceLogout)
  ]);
}

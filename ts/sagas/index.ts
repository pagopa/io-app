/**
 * The root saga that forks and includes all the other sagas.
 */
import { networkEventsListenerSaga } from "react-native-offline";
import { all, call, Effect } from "redux-saga/effects";

import backendInfoSaga from "./backendInfo";
import { watchContentServiceLoadSaga } from "./contentLoaders";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";
import { watchNavigateToDeepLinkSaga } from "./watchNavigateToDeepLinkSaga";

import { apiUrlPrefix } from "../config";

// Parameters used by the withNetworkConnectivity HOC of react-native-offline.
// We use `withRedux: true` to store the network status in the redux store.
// More info at https://github.com/rauliyohmc/react-native-offline#withnetworkconnectivity
const connectionMonitorParameters = {
  withRedux: true,
  timeout: 2500,
  pingServerUrl: `${apiUrlPrefix}/ping`, // PING endpoint of the app backend
  withExtraHeadRequest: true,
  checkConnectionInterval: 10000
};

export default function* root(): Iterator<Effect> {
  yield all([
    call(startupSaga),
    call(backendInfoSaga),
    call(networkEventsListenerSaga, connectionMonitorParameters),
    call(watchNavigateToDeepLinkSaga),
    call(loadSystemPreferencesSaga),
    call(watchContentServiceLoadSaga)
  ]);
}

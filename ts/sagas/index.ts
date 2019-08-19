/**
 * The root saga that forks and includes all the other sagas.
 */
import { networkSaga } from "react-native-offline";
import { all, call, Effect } from "redux-saga/effects";

import backendInfoSaga from "./backendInfo";
import {
  watchContentMunicipalityLoadSaga,
  watchContentServiceLoadSaga
} from "./contentLoaders";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";
import { watchNavigateToDeepLinkSaga } from "./watchNavigateToDeepLinkSaga";

import { apiUrlPrefix } from "../config";
import {
  watchBackToEntrypointPaymentSaga,
  watchPaymentInitializeSaga
} from "./wallet";

// Parameters used by the withNetworkConnectivity HOC of react-native-offline.
// We use `withRedux: true` to store the network status in the redux store.
// More info at https://github.com/rauliyohmc/react-native-offline#withnetworkconnectivity
const connectionMonitorParameters = {
  withRedux: true,
  pingTimeout: 3000,
  pingServerUrl: `${apiUrlPrefix}/ping`, // PING endpoint of the app backend
  shouldPing: true,
  pingInterval: 30000
};

export default function* root(): Iterator<Effect> {
  yield all([
    call(startupSaga),
    call(backendInfoSaga),
    call(networkSaga, connectionMonitorParameters),
    call(watchNavigateToDeepLinkSaga),
    call(loadSystemPreferencesSaga),
    call(watchContentServiceLoadSaga),
    call(watchContentMunicipalityLoadSaga),
    call(watchPaymentInitializeSaga),
    call(watchBackToEntrypointPaymentSaga)
  ]);
}

/**
 * The root saga that forks and includes all the other sagas.
 */
import { networkEventsListenerSaga } from "react-native-offline";
import { all, call, Effect } from "redux-saga/effects";

import backendInfoSaga from "./backendInfo";
import {
  organizationContentLoaderSaga,
  serviceContentLoaderSaga
} from "./contentLoaders";
import deepLink from "./deepLink";
import notificationsSaga from "./notifications";
import preferencesSaga from "./preferences";
import profileSaga from "./profile";
import { startupSaga } from "./startup";
import walletSaga from "./wallet";

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
    call(notificationsSaga),
    call(profileSaga), // FIXME: transform into callable saga
    call(walletSaga),
    call(backendInfoSaga),
    call(networkEventsListenerSaga, connectionMonitorParameters),
    call(deepLink),
    call(preferencesSaga),
    call(organizationContentLoaderSaga),
    call(serviceContentLoaderSaga)
  ]);
}

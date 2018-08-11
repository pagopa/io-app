/**
 * The root saga that forks and includes all the other sagas.
 */
import { networkEventsListenerSaga } from "react-native-offline";
import { all, Effect, fork } from "redux-saga/effects";

import authenticationSaga from "./authentication";
import backendInfoSaga from "./backendInfo";
import { contentSaga } from "./content";
import deepLink from "./deepLink";
import messagesSaga from "./messages";
import notificationsSaga from "./notifications";
import pinSetSaga from "./pinset";
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
    fork(authenticationSaga),
    fork(notificationsSaga),
    fork(pinSetSaga),
    fork(messagesSaga),
    fork(startupSaga),
    fork(profileSaga),
    fork(walletSaga),
    fork(backendInfoSaga),
    fork(networkEventsListenerSaga, connectionMonitorParameters),
    fork(deepLink),
    fork(preferencesSaga),
    fork(contentSaga)
  ]);
}

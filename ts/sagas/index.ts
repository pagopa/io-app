/**
 * The root saga that forks and includes all the other sagas.
 */
import { networkEventsListenerSaga } from "react-native-offline";
import { all, Effect, fork } from "redux-saga/effects";

import authenticationSaga from "./authentication";
import backendInfoSaga from "./backendInfo";
import deeplinkSaga from "./deeplink";
import mainSaga from "./main";
import messagesSaga from "./messages";
import notificationsSaga from "./notifications";
import onboardingSaga from "./onboarding";
import pinLoginSaga from "./pinlogin";
import profileSaga from "./profile";
import startupSaga from "./startup";
import walletSaga from "./wallet";

// Parameters used by the withNetworkConnectivity HOC of react-native-offline.
// We use `withRedux: true` to store the network status in the redux store.
// More info at https://github.com/rauliyohmc/react-native-offline#withnetworkconnectivity
const connectionMonitorParameters = {
  withRedux: true,
  timeout: 2500,
  pingServerUrl: "https://google.com",
  withExtraHeadRequest: true,
  checkConnectionInterval: 5000
};

export default function* root(): Iterator<Effect> {
  yield all([
    fork(authenticationSaga),
    fork(backendInfoSaga),
    fork(deeplinkSaga),
    fork(mainSaga),
    fork(messagesSaga),
    fork(networkEventsListenerSaga, connectionMonitorParameters),
    fork(notificationsSaga),
    fork(onboardingSaga),
    fork(pinLoginSaga),
    fork(profileSaga),
    fork(startupSaga),
    fork(walletSaga)
  ]);
}

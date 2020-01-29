/**
 * The root saga that forks and includes all the other sagas.
 */
import { networkSaga } from "react-native-offline";
import { all, call, Effect } from "redux-saga/effects";
import { apiUrlPrefix } from "../config";
import backendInfoSaga from "./backendInfo";
import {
  watchContentMunicipalityLoadSaga,
  watchContentServicesByScopeLoad,
  watchServiceMetadataLoadSaga
} from "./contentLoaders";
import unreadInstabugMessagesSaga from "./instabug";
import { loadSystemPreferencesSaga } from "./preferences";
import { startupSaga } from "./startup";
import { checkEmailNotificationPreferencesSaga } from "./startup/checkEmailNotificationPreferencesSaga";
import {
  watchBackToEntrypointPaymentSaga,
  watchPaymentInitializeSaga
} from "./wallet";
import { watchNavigateToDeepLinkSaga } from "./watchNavigateToDeepLinkSaga";

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
    call(checkEmailNotificationPreferencesSaga),
    call(watchServiceMetadataLoadSaga),
    call(watchContentMunicipalityLoadSaga),
    call(watchContentServicesByScopeLoad),
    call(watchPaymentInitializeSaga),
    call(watchBackToEntrypointPaymentSaga),
    call(unreadInstabugMessagesSaga)
  ]);
}

/**
 * The root saga that forks and includes all the other sagas.
 *
 * @flow
 */

import { type Saga } from 'redux-saga'
import { all, fork } from 'redux-saga/effects'
import { networkEventsListenerSaga } from 'react-native-offline'

import profileSaga from './profile'

// Parameters used by the withNetworkConnectivity HOC of react-native-offline.
// We use `withRedux: true` to store the network status in the redux store.
// More info at https://github.com/rauliyohmc/react-native-offline#withnetworkconnectivity
const connectionMonitorParameters = {
  withRedux: true,
  timeout: 5000,
  pingServerUrl: 'https://google.com',
  withExtraHeadRequest: true,
  checkConnectionInterval: 2500
}

export default function* root(): Saga<void> {
  yield all([
    fork(profileSaga),
    fork(networkEventsListenerSaga, connectionMonitorParameters)
  ])
}

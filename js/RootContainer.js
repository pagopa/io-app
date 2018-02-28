import React from 'react'
import { withNetworkConnectivity } from 'react-native-offline'
import { Root } from 'native-base'

import ConnectionBar from './components/ConnectionBar'
import Navigation from './navigation'

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

/**
 * The main container of the application with the ConnectionBar and the Navigator
 */
const RootContainer = () => {
  return (
    <Root>
      <ConnectionBar />
      <Navigation />
    </Root>
  )
}

export default withNetworkConnectivity(connectionMonitorParameters)(
  RootContainer
)

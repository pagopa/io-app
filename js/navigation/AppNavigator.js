// @flow

import { SwitchNavigator } from 'react-navigation'

import ROUTES from './routes'
import IngressScreen from '../screens/IngressScreen'
import AuthenticationNavigator from './AuthenticationNavigator'
import MainNavigator from './MainNavigator'

/**
 * The main stack of screens of the application.
 * SwitchNavigator is very usefull here because it automatically
 * reset the state on navigation
 */
const navigator = SwitchNavigator({
  [ROUTES.INGRESS]: {
    screen: IngressScreen // The screen that choose the real inital screen of the App
  },
  [ROUTES.AUTHENTICATION]: {
    screen: AuthenticationNavigator // The navigator used for unautenticated users
  },
  [ROUTES.MAIN]: {
    screen: MainNavigator // The navigator used for authenticated users
  }
})

export default navigator

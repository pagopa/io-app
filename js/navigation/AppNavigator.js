// @flow

import { SwitchNavigator } from 'react-navigation'

import ROUTES from './routes'
import IngressScreen from '../screens/IngressScreen'
import AuthenticationNavigator from './AuthenticationNavigator'
import MainNavigator from './MainNavigator'

/**
 * The main stack of screens of the application.
 * SwitchNavigator is very useful here because it automatically
 * resets the state on navigation
 */
const navigator = SwitchNavigator({
  [ROUTES.INGRESS]: {
    // This screen check if the user is authenticated than perform a redirect to
    // MainNavigator (if authenticated) or AuthenticationNavigator (otherwise)
    screen: IngressScreen
  },
  [ROUTES.AUTHENTICATION]: {
    // The navigator used for unauthenticated users
    screen: AuthenticationNavigator
  },
  [ROUTES.MAIN]: {
    // The navigator used for authenticated users
    screen: MainNavigator
  }
})

export default navigator

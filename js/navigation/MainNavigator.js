// @flow

import { StackNavigator } from 'react-navigation'

import ROUTES from './routes'
import IngressScreen from '../screens/IngressScreen'
import LoginScreen from '../screens/LoginScreen'
import HomeNavigator from './HomeNavigator'

/**
 * The main stack of screens of the application.
 */
const navigator = StackNavigator(
  {
    [ROUTES.INGRESS]: {
      screen: IngressScreen
    },
    [ROUTES.LOGIN]: {
      screen: LoginScreen
    },
    [ROUTES.HOME]: {
      screen: HomeNavigator
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: 'none'
  }
)

export default navigator

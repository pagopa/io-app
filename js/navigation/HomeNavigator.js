// @flow

import { TabNavigator } from 'react-navigation'

import ROUTES from './routes'
import MessagesScreen from '../screens/MessagesScreen'
import ProfileScreen from '../screens/ProfileScreen'

/**
 * A navigator for all the screens used when the user is authenticated.
 */
const navigation = TabNavigator(
  {
    [ROUTES.MESSAGES]: {
      screen: MessagesScreen
    },
    [ROUTES.PROFILE]: {
      screen: ProfileScreen
    }
  },
  {
    initialRouteName: ROUTES.MESSAGES,
    tabBarPosition: 'bottom'
  }
)

export default navigation

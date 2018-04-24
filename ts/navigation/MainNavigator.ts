import { TabNavigator, NavigationContainer } from 'react-navigation'

import ROUTES from './routes'
import MessagesScreen from '../screens/main/MessagesScreen'
import ProfileScreen from '../screens/main/ProfileScreen'

/**
 * A navigator for all the screens used when the user is authenticated.
 */
const navigation = TabNavigator(
  {
    [ROUTES.MAIN_MESSAGES]: {
      screen: MessagesScreen
    },
    [ROUTES.MAIN_PROFILE]: {
      screen: ProfileScreen
    }
  },
  {
    initialRouteName: ROUTES.MAIN_MESSAGES,
    tabBarPosition: 'bottom'
  }
)

export default navigation

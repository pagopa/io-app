import { StackNavigator } from 'react-navigation'

import LoginScreen from './components/LoginScreen'
import ProfileScreen from './components/ProfileScreen'
import DigitalAddressScreen from './components/DigitalAddressScreen'
import TopicsSelectionScreen from './components/TopicsSelectionScreen'

import { ROUTES } from './utils/constants'

// Initialize the stack navigator
const HomeRoutes = {
  [ROUTES.HOME]: {
    screen: LoginScreen,
  },

  [ROUTES.PROFILE]: {
    screen: ProfileScreen,
  },
}

const HomeNavigator = StackNavigator({
  ...HomeRoutes,
}, {
  initialRouteName: ROUTES.HOME,

  // Let each screen handle the header and navigation
  headerMode: 'none'
})

const ProfileNavigator = StackNavigator({
  ...HomeRoutes,

  [ROUTES.DIGITAL_ADDRESS]: {
    screen: DigitalAddressScreen,
  },

  [ROUTES.TOPICS_SELECTION]: {
    screen: TopicsSelectionScreen,
  }
}, {
  initialRouteName: ROUTES.PROFILE,

  // Let each screen handle the header and navigation
  headerMode: 'none',
})

module.exports = {
  HomeNavigator,
  ProfileNavigator,
}

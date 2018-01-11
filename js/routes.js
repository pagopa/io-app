import { StackNavigator, HeaderBackButton } from 'react-navigation'

import LoginScreen from './components/LoginScreen'
import ProfileScreen from './components/ProfileScreen'
import DigitalAddressScreen from './components/DigitalAddressScreen'
import TopicsSelectionScreen from './components/TopicsSelectionScreen'
import NoSpidScreen from './components/NoSpidScreen'

import { ROUTES } from './utils/constants'

// Initialize the stack navigator
const HomeRoutes = {
  [ROUTES.HOME]: {
    screen: LoginScreen
  },

  [ROUTES.PROFILE]: {
    screen: ProfileScreen
  },

  [ROUTES.NOT_SPID]: {
    screen: NoSpidScreen
  }
}

const HomeNavigator = StackNavigator(
  {
    ...HomeRoutes
  },
  {
    initialRouteName: ROUTES.HOME,

    // Let each screen handle the header and navigation
    headerMode: 'none'
  }
)

const ProfileNavigator = StackNavigator(
  {
    ...HomeRoutes,

    [ROUTES.DIGITAL_ADDRESS]: {
      screen: DigitalAddressScreen
    },

    [ROUTES.TOPICS_SELECTION]: {
      screen: TopicsSelectionScreen
    }
  },
  {
    initialRouteName: ROUTES.PROFILE,

    // Let each screen handle the header and navigation
    headerMode: 'none'
  }
)

const NoSpidNavigator = StackNavigator(
  {
    ...HomeRoutes
  },
  {
    initialRouteName: ROUTES.NOT_SPID,

    // Let each screen handle the header and navigation
    headerMode: 'none'
  }
)

module.exports = {
  HomeNavigator,
  ProfileNavigator,
  NoSpidNavigator
}

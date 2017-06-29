import { StackNavigator } from 'react-navigation'

import LoginScreen from './components/LoginScreen'
import ProfileScreen from './components/ProfileScreen'
import DigitalAddressScreen from './components/DigitalAddressScreen'
import TopicsSelectionScreen from './components/TopicsSelectionScreen'

// Initialize the stack navigator
const HomeRoutes = {
  Home: {
    screen: LoginScreen,
  },

  Profile: {
    screen: ProfileScreen,
  },
}

const HomeNavigator = StackNavigator({
  ...HomeRoutes,
}, {
  initialRouteName: 'Home',

  // Let each screen handle the header and navigation
  headerMode: 'none'
})

const ProfileNavigator = StackNavigator({
  ...HomeRoutes,

  DigitalAddress: {
    screen: DigitalAddressScreen,
  },

  TopicsSelection: {
    screen: TopicsSelectionScreen,
  }
}, {
  initialRouteName: 'Profile',

  // Let each screen handle the header and navigation
  headerMode: 'none',
})

module.exports = {
  HomeNavigator,
  ProfileNavigator,
}

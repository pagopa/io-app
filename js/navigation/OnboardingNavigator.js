// @flow

import { StackNavigator } from 'react-navigation'

import ROUTES from './routes'
import TosScreen from '../screens/onboarding/TosScreen'
import PinScreen from '../screens/onboarding/PinScreen'
import BiometricScreen from '../screens/onboarding/BiometricScreen'

/**
 * The onboarding related stack of screens of the application.
 */
const navigator = StackNavigator(
  {
    [ROUTES.ONBOARDING_TOS]: {
      screen: TosScreen
    },
    [ROUTES.ONBOARDING_PIN]: {
      screen: PinScreen
    },
    [ROUTES.ONBOARDING_BIOMETRIC]: {
      screen: BiometricScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: 'none'
  }
)

export default navigator

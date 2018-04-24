import { StackNavigator } from 'react-navigation'

import ROUTES from './routes'
import TosScreen from '../screens/onboarding/TosScreen'
import PinScreen from '../screens/onboarding/PinScreen'

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
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: 'none'
  }
)

export default navigator

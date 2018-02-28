import { ProfileNavigator, HomeNavigator } from '../navigation'
import ROUTES from '../navigation/routes'

const loggedOutInitialState = HomeNavigator.router.getStateForAction(
  HomeNavigator.router.getActionForPathAndParams(ROUTES.HOME)
)

const navReducer = (state = loggedOutInitialState, action) => {
  const nextState = ProfileNavigator.router.getStateForAction(action, state)

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state
}

export default navReducer

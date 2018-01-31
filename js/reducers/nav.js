import { ProfileNavigator, HomeNavigator } from '../routes'
import { ROUTES } from '../utils/constants'

const loggedOutInitialState = HomeNavigator.router.getStateForAction(
  HomeNavigator.router.getActionForPathAndParams(ROUTES.HOME)
)

const navReducer = (state = loggedOutInitialState, action) => {
  const nextState = ProfileNavigator.router.getStateForAction(action, state)

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state
}

export default navReducer

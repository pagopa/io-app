import { ProfileNavigator, HomeNavigator } from '../routes'

const loggedOutInitialState = HomeNavigator.router.getStateForAction(
  HomeNavigator.router.getActionForPathAndParams('Home')
)
const loggedInInitialState = ProfileNavigator.router.getStateForAction(
  ProfileNavigator.router.getActionForPathAndParams('Profile')
)

const navReducer = (state = loggedOutInitialState, action) => {
  const nextState = ProfileNavigator.router.getStateForAction(action, state)

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state
}

export default navReducer

// @flow

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { StackNavigator, addNavigationHelpers } from 'react-navigation'

import type { MapStateToProps } from 'react-redux'
import type { NavigationState } from 'react-navigation/src/TypeDefinition'

import ROUTES from './routes'
import LoginScreen from '../components/LoginScreen'
import ProfileScreen from '../components/ProfileScreen'

import type { ApiUserProfile } from '../utils/api'
import type { Dispatch } from '../actions/types'

// Initialize the stack navigator
const HomeRoutes = {
  [ROUTES.HOME]: {
    screen: LoginScreen
  },

  [ROUTES.PROFILE]: {
    screen: ProfileScreen
  }
}

export const HomeNavigator = StackNavigator(
  {
    ...HomeRoutes
  },
  {
    initialRouteName: ROUTES.HOME,

    // Let each screen handle the header and navigation
    headerMode: 'none'
  }
)

export const ProfileNavigator = StackNavigator(
  {
    ...HomeRoutes
  },
  {
    initialRouteName: ROUTES.PROFILE,

    // Let each screen handle the header and navigation
    headerMode: 'none'
  }
)

type Props = {
  profile: ApiUserProfile,
  nav: NavigationState,
  dispatch: Dispatch
}

/**
 * Main app navigator.
 */
class Navigation extends Component<Props> {
  render() {
    const { profile } = this.props
    const Navigator = profile ? ProfileNavigator : HomeNavigator

    return (
      <Navigator
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.nav
        })}
      />
    )
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: Object) => ({
  profile: state.user.profile,
  nav: state.nav
})

export default connect(mapStateToProps)(Navigation)

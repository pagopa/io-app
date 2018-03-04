// @flow

import React, { Component } from 'react'
import { BackHandler } from 'react-native'
import { connect } from 'react-redux'
import { addNavigationHelpers, NavigationActions } from 'react-navigation'
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers'

import type { MapStateToProps } from 'react-redux'
import type { NavigationState } from 'react-navigation'

import MainNavigator from './MainNavigator'

import type { Dispatch } from '../actions/types'

// A key to identify the Set of the listeners of the navigtion middleware.
export const navigationMiddlewareListenersKey = 'root'

/**
 * A listener of the new react-navigation redux middleware.
 * The parameter must be the same used in createReactNavigationReduxMiddleware function.
 */
const addListener = createReduxBoundAddListener(
  navigationMiddlewareListenersKey
)

type Props = {
  navigation: NavigationState,
  dispatch: Dispatch
}

/**
 * Main app navigator.
 */
class Navigation extends Component<Props> {
  componentDidMount() {
    // Add an handler for the hardware back button in Android
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
  }

  componentWillUnmount() {
    // Remove handler for the hardware back button in Android
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  /**
   * Handle the hardware back button in Android.
   * It returns a boolean that if true avoid invoking the default back button
   * functionality to exit the app.
   */
  onBackPress = (): boolean => {
    const { dispatch, navigation } = this.props
    // If we are on the first screen of the stack we can exit from the application
    if (navigation.index === 0) {
      return false
    }
    dispatch(NavigationActions.back())
    return true
  }

  render() {
    return (
      <MainNavigator
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.navigation,
          addListener
        })}
      />
    )
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: Object) => ({
  navigation: state.navigation
})

export default connect(mapStateToProps)(Navigation)

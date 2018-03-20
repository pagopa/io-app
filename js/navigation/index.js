// @flow

import * as React from 'react'
import { BackHandler } from 'react-native'
import { connect } from 'react-redux'
import {
  type NavigationState,
  addNavigationHelpers,
  NavigationActions
} from 'react-navigation'
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers'

import { NAVIGATION_MIDDLEWARE_LISTENERS_KEY } from '../utils/constants'
import { type ReduxProps } from '../actions/types'
import { type GlobalState } from '../reducers/types'
import MainNavigator from './MainNavigator'

/**
 * A listener of the new react-navigation redux middleware.
 * The parameter must be the same used in createReactNavigationReduxMiddleware function.
 */
const addListener = createReduxBoundAddListener(
  NAVIGATION_MIDDLEWARE_LISTENERS_KEY
)

type ReduxMappedProps = {
  nav: NavigationState
}

type OwnProps = {}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * Main app navigator.
 */
class Navigation extends React.Component<Props> {
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
    const { dispatch, nav } = this.props
    // If we are on the first screen of the stack we can exit from the application
    // eslint-disable-next-line no-magic-numbers
    if (nav.index === 0) {
      return false
    }
    dispatch(NavigationActions.back())
    return true
  }

  render(): React.Node {
    return (
      <MainNavigator
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.nav,
          addListener
        })}
      />
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  nav: state.navigation
})

export default connect(mapStateToProps)(Navigation)

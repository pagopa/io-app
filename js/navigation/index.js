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

const addListener = createReduxBoundAddListener('root')

type Props = {
  navigation: NavigationState,
  dispatch: Dispatch
}

/**
 * Main app navigator.
 */
class Navigation extends Component<Props> {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  onBackPress = () => {
    const { dispatch, navigation } = this.props
    if (navigation.index <= 1) {
      BackHandler.exitApp()
      return
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

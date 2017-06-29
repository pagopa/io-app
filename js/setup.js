/**
 * Sets up store, navigation and initial app screen.
 *
 * @flow
 */

'use strict'

import React from 'react'

import { Provider, connect } from 'react-redux'
import { addNavigationHelpers } from 'react-navigation'
import Mixpanel from 'react-native-mixpanel'

import { StyleProvider } from 'native-base'
import getTheme from '../native-base-theme/components'
import commonColors from '../native-base-theme/variables/commonColor'

import configureStore from './store/configureStore'
import { ProfileNavigator, HomeNavigator } from './routes'

import config from './config'

Mixpanel.sharedInstanceWithToken(config.mixPanelToken)

const theme = getTheme(commonColors)

class AppNavigation extends React.Component {
  render() {
    const profile = this.props.store.getState().user.profile
    const Navigator = profile ? ProfileNavigator : HomeNavigator

    return (
      <Navigator navigation={addNavigationHelpers({
        dispatch: this.props.dispatch,
        state: this.props.nav,
      })} />
    )
  }
}

const mapStateToProps = (state) => ({
  nav: state.nav,
})

const AppWithNavigationState = connect(mapStateToProps)(AppNavigation)

class Root extends React.Component {

  state: {
    isLoading: boolean,
    store: any,
  };

  constructor() {
    super()

    const store = configureStore(() => this.setState({
      isLoading: false
    }))

    this.state = {
      isLoading: true,
      store: store,
    }

  }

  render() {
    if (this.state.isLoading) {
      return null
    }

    const { store } = this.state

    return (
      <StyleProvider style={theme}>
        <Provider store={store}>
          <AppWithNavigationState store={store} />
        </Provider>
      </StyleProvider>
    )
  }
}

module.exports = () => Root

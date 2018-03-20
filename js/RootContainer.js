// @flow

import React, { Component } from 'react'
import { AppState } from 'react-native'
import { connect } from 'react-redux'

import { Root } from 'native-base'

import { type ReduxProps, type ApplicationState } from './actions/types'
import { APP_STATE_CHANGE_ACTION } from './store/actions/constants'
import ConnectionBar from './components/ConnectionBar'
import Navigation from './navigation'

type ReduxMappedProps = {}

type OwnProps = {}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * The main container of the application with the ConnectionBar and the Navigator
 */
class RootContainer extends Component<Props> {
  componentDidMount() {
    AppState.addEventListener('change', this._onApplicationActivityChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._onApplicationActivityChange)
  }

  render(): React$Element<*> {
    return (
      <Root>
        <ConnectionBar />
        <Navigation />
      </Root>
    )
  }

  _onApplicationActivityChange = (activity: ApplicationState) => {
    this.props.dispatch({
      type: APP_STATE_CHANGE_ACTION,
      payload: activity
    })
  }
}

export default connect()(RootContainer)

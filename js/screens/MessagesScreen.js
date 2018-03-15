// @flow

import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'

import { Container } from 'native-base'

import { type ReduxProps } from '../actions/types'
import { type UserState } from '../reducers/user'
import MessagesComponent from '../components/MessagesComponent'

import { type GlobalState } from '../reducers/types'

type ReduxMappedProps = {
  user: UserState
}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * This screen show the messages to the authenticated user.
 */
class MessagesScreen extends Component<Props> {
  constructor(props) {
    super(props)
  }

  render() {
    const { user, navigation, dispatch } = this.props

    if (!user.isLoggedIn) return null

    return (
      <Container>
        <MessagesComponent
          user={user}
          navigation={navigation}
          dispatch={dispatch}
        />
      </Container>
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  user: state.user,
  navigation: state.navigation
})

export default connect(mapStateToProps)(MessagesScreen)

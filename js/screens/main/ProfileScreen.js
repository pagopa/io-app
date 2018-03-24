// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'

import { Container } from 'native-base'

import { type GlobalState } from '../reducers/types'
import { type ReduxProps } from '../actions/types'
import { type UserState } from '../reducers/user'
import { type ProfileState } from '../store/reducers/profile'
import ProfileComponent from '../components/ProfileComponent'

type ReduxMappedProps = {
  user: UserState,
  preferences: ProfileState
}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * This screen show the profile to the authenticated user.
 */
class ProfileScreen extends React.Component<Props> {
  render(): React.Node {
    const { user, preferences, navigation, dispatch } = this.props

    if (!user.isLoggedIn) {
      return null
    }

    return (
      <Container>
        <ProfileComponent
          user={user}
          preferences={preferences}
          navigation={navigation}
          dispatch={dispatch}
        />
      </Container>
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  user: state.user,
  navigation: state.navigation,
  preferences: state.profile
})

export default connect(mapStateToProps)(ProfileScreen)

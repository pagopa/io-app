import * as React from 'react'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { Container } from 'native-base'
import { GlobalState } from '../../reducers/types'
import { ReduxProps } from '../../actions/types'

export type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

export type Props = OwnProps
/**
 * This screen show the profile to the authenticated user.
 */
class ProfileScreen extends React.Component<Props, never> {
  render() {
    return <Container />
  }
}

export default ProfileScreen

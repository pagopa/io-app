// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'
import { Container, Content } from 'native-base'

import { type ReduxProps } from '../../actions/types'

type ReduxMappedProps = {}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * A screen that allows the user to set the Biometric.
 *
 * NOTE: Currently an empty screen just to test the navigation.
 * @https://www.pivotaltracker.com/story/show/156990825
 */
class BiometricScreen extends React.Component<Props> {
  render(): React.Node {
    return (
      <Container>
        <Content />
      </Container>
    )
  }
}

export default connect()(BiometricScreen)

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
 * A screen that allows the user to set the PIN.
 *
 * NOTE: Currently an empty screen just to test the navigation.
 */
class PinScreen extends React.Component<Props> {
  render(): React.Node {
    return (
      <Container>
        <Content />
      </Container>
    )
  }
}

export default connect()(PinScreen)

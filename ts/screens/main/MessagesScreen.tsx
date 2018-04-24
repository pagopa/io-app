import * as React from 'react'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { Container } from 'native-base'
import { ReduxProps } from '../../actions/types'
import { GlobalState } from '../../reducers/types'

export type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

export type Props = OwnProps

/**
 * This screen show the messages to the authenticated user.
 */
class MessagesScreen extends React.Component<Props, never> {
  constructor(props) {
    super(props)
  }

  render() {
    return <Container />
  }
}

export default MessagesScreen

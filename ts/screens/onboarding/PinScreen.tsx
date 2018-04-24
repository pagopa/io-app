import * as React from 'react'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { Container, Content } from 'native-base'
import { ReduxProps } from '../../actions/types'
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
class PinScreen extends React.Component<Props, never> {
  render() {
    return (
      <Container>
        <Content />
      </Container>
    )
  }
}
export default connect()(PinScreen)

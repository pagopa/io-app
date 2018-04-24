import * as React from 'react'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { Container } from 'native-base'
import { ReduxProps } from '../../actions/types'
import { UserState } from '../../reducers/user'
import MessagesComponent from '../../components/MessagesComponent'
import { GlobalState } from '../../reducers/types'
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
class MessagesScreen extends React.Component<Props, never> {
  constructor(props) {
    super(props)
  }
  render() {
    const { user, navigation, dispatch } = this.props
    if (!user.isLoggedIn) {
      return null
    }
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

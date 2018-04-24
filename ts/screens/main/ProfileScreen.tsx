import * as React from 'react'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { Container } from 'native-base'
import { GlobalState } from '../../reducers/types'
import { ReduxProps } from '../../actions/types'
import { UserState } from '../../reducers/user'
import ProfileComponent from '../../components/ProfileComponent'
type ReduxMappedProps = {
  user: UserState
}
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}
type Props = ReduxMappedProps & ReduxProps & OwnProps
/**
 * This screen show the profile to the authenticated user.
 */
class ProfileScreen extends React.Component<Props, never> {
  render() {
    const { user, navigation, dispatch } = this.props
    if (!user.isLoggedIn) {
      return null
    }
    return (
      <Container>
        <ProfileComponent
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
export default connect(mapStateToProps)(ProfileScreen)

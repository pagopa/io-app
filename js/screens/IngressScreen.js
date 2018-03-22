// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import { StyleSheet, ActivityIndicator } from 'react-native'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'

import { Container } from 'native-base'
import variables from '../theme/variables'

import ROUTES from '../navigation/routes'
import { type ReduxProps } from '../actions/types'
import { type UserState } from '../reducers/user'

import { type GlobalState } from '../reducers/types'

type ReduxMappedProps = {
  user: UserState
}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variables.brandPrimary
  }
})

/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
class IngressScreen extends React.Component<Props> {
  // Check the user state in the store and navigate to the proper screen
  componentDidMount() {
    const { user } = this.props
    if (user.isLoggedIn) {
      this.props.navigation.navigate(ROUTES.MAIN)
    } else {
      this.props.navigation.navigate(ROUTES.AUTHENTICATION)
    }
  }

  render(): React.Node {
    return (
      <Container style={styles.container}>
        <ActivityIndicator color={variables.brandPrimaryInverted} />
      </Container>
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  user: state.user
})

export default connect(mapStateToProps)(IngressScreen)

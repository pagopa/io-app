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

import { type ReduxProps } from '../actions/types'
import { type GlobalState } from '../reducers/types'
import { type SessionState } from '../store/reducers/session'
import { applicationInitialized } from '../store/actions/application'

type ReduxMappedProps = {
  session: SessionState
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
  componentDidMount() {
    // Dispatch APPLICATION_INITIALIZED to start the Autentication saga
    this.props.dispatch(applicationInitialized())
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
  session: state.session
})

export default connect(mapStateToProps)(IngressScreen)

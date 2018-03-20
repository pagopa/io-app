// @flow

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, ActivityIndicator } from 'react-native'
import { type NavigationAction, NavigationActions } from 'react-navigation'

import { Container } from 'native-base'
import material from '../../native-base-theme/variables/material'

import ROUTES from '../navigation/routes'
import { type ReduxProps } from '../actions/types'
import { type UserState } from '../reducers/user'

import { type GlobalState } from '../reducers/types'

type ReduxMappedProps = {
  user: UserState
}

type OwnProps = {}

type Props = ReduxMappedProps & ReduxProps & OwnProps

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: material.brandLight
  }
})

/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
class IngressScreen extends Component<Props> {
  // Check the user state in the store and navigate to the proper screen
  componentDidMount() {
    const { user, dispatch } = this.props
    if (user.isLoggedIn) {
      dispatch(this.navigate(ROUTES.HOME))
    } else {
      dispatch(this.navigate(ROUTES.LOGIN))
    }
  }

  render(): React$Element<*> {
    return (
      <Container style={styles.container}>
        <ActivityIndicator color={material.brandPrimary} />
      </Container>
    )
  }

  navigate = (route: string): NavigationAction => {
    return NavigationActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: route
        })
      ]
    })
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  user: state.user
})

export default connect(mapStateToProps)(IngressScreen)

// @flow

import React, { Component } from 'react'
import { connect, type MapStateToProps } from 'react-redux'
import { StyleSheet, ActivityIndicator } from 'react-native'
import { NavigationActions, type NavigationScreenProp } from 'react-navigation'

import { Container } from 'native-base'
import material from '../../native-base-theme/variables/material'

import ROUTES from '../navigation/routes'
import type { Dispatch, AnyAction } from '../actions/types'
import type { UserState } from '../reducers/user'

type Props = {
  user: UserState,
  navigation: NavigationScreenProp<*, AnyAction>,
  dispatch: Dispatch
}

/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
class IngressScreen extends Component<Props> {
  componentWillMount() {
    const { user, dispatch } = this.props
    if (user.isLoggedIn) {
      dispatch(this.navigate(ROUTES.HOME))
    } else {
      dispatch(this.navigate(ROUTES.LOGIN))
    }
  }

  render() {
    return (
      <Container style={styles.container}>
        <ActivityIndicator color={material.brandPrimary} />
      </Container>
    )
  }

  navigate = (route: string) => {
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: Object) => ({
  user: state.user,
  navigation: state.navigation
})

export default connect(mapStateToProps)(IngressScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: material.brandLight
  }
})

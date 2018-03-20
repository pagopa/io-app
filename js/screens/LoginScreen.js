/**

 * @flow
 */

'use strict'

import * as React from 'react'
import { connect } from 'react-redux'

import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Keyboard,
  Animated
} from 'react-native'

import I18n from '../i18n'

import { H1, H2 } from 'native-base'

import type EmitterSubscription from 'EmitterSubscription'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'

import { SpidLoginButton } from '../components/SpidLoginButton'
import SpidSubscribeComponent from '../components/SpidSubscribeComponent'

import { logInIntent, selectIdp, logIn, logInError } from '../actions'

import { VERSION } from '../utils/constants'
import ROUTES from '../navigation/routes'

import { type IdentityProvider, isDemoIdp } from '../utils/api'

import { type ReduxProps } from '../actions/types'
import { type GlobalState } from '../reducers/types'
import { type UserState } from '../reducers/user'

// Due to a bug, the following style must be wrapped
// with a call to StyleSheet.flatten()
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  titleText: {
    textAlign: 'center',
    color: '#fff'
  },
  version: {
    position: 'absolute',
    bottom: 10,
    right: 10
  }
})

const titleTextStyles = StyleSheet.flatten(styles.titleText)

// height of the logo at start and end of the animation
// that makes space for the keyboard when inputing the
// user email
const ANIMATION_START_LOGO_HEIGHT = 70
const ANIMATION_END_LOGO_HEIGHT = 0

type ReduxMappedProps = {
  isConnected: boolean,
  user: UserState
}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

type State = {
  imageHeight: Animated.Value
}

/**
 * Implements the login screen.
 */
class LoginScreen extends React.Component<Props, State> {
  // called when keyboard appears
  keyboardWillShowSub: EmitterSubscription
  // called when keyboard disappears
  keyboardWillHideSub: EmitterSubscription

  constructor(props) {
    super(props)
    this.state = {
      imageHeight: new Animated.Value(ANIMATION_START_LOGO_HEIGHT)
    }
  }

  componentWillMount() {
    // setup keyboard event handlers
    this.keyboardWillShowSub = Keyboard.addListener(
      'keyboardWillShow',
      this.keyboardWillShow
    )
    this.keyboardWillHideSub = Keyboard.addListener(
      'keyboardWillHide',
      this.keyboardWillHide
    )
  }

  componentWillUnmount() {
    // remove keyboard event handlers
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  // when keyboard appears, we shrink the logo
  keyboardWillShow = event => {
    Animated.timing(this.state.imageHeight, {
      duration: event.duration,
      toValue: ANIMATION_END_LOGO_HEIGHT
    }).start()
  }

  // when keyboard disappears we expand the logo to original size
  keyboardWillHide = event => {
    Animated.timing(this.state.imageHeight, {
      duration: event.duration,
      toValue: ANIMATION_START_LOGO_HEIGHT
    }).start()
  }

  handleIpdSelection = (idp: IdentityProvider) => {
    // if the selected idp is the demo one simulate a sucessfull login
    if (isDemoIdp(idp)) {
      this.props.dispatch(selectIdp(idp))
      this.props.dispatch(logIn('demo', idp.id))
      this.props.navigation.navigate(ROUTES.HOME)
    } else {
      this.props.dispatch(selectIdp(idp))
    }
  }

  handleLoginIntent = () => {
    this.props.dispatch(logInIntent())
  }

  render(): React.Node {
    // When we have no connectivity disable the SpidLoginButton
    const { isConnected } = this.props
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={{ height: 20 }} />
        <Animated.Image
          source={require('../../img/logo-it.png')}
          style={[
            {
              resizeMode: 'contain'
            },
            { height: this.state.imageHeight }
          ]}
        />
        <View style={{ height: 100, paddingTop: 20 }}>
          <H2 style={titleTextStyles}>{I18n.t('login.welcome.line1')}</H2>
          <H1 style={titleTextStyles}>{I18n.t('login.welcome.line2')}</H1>
        </View>
        <SpidLoginButton
          disabled={!isConnected}
          userState={this.props.user}
          onSelectIdp={(idp: IdentityProvider): void =>
            this.handleIpdSelection(idp)
          }
          onSpidLoginIntent={(): void => this.handleLoginIntent()}
          onSpidLogin={(token, idpId) => {
            this.props.dispatch(logIn(token, idpId))
            this.props.navigation.navigate(ROUTES.HOME)
          }}
          onSpidLoginError={error => {
            this.props.dispatch(logInError(error))
          }}
        />
        <View style={{ height: 10 }} />
        <SpidSubscribeComponent />
        <View style={{ height: 60 }} />
        <View style={styles.version}>
          <Text style={titleTextStyles}>
            {I18n.t('global.app.version')} {VERSION}
          </Text>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isConnected: state.network.isConnected,
  user: state.user
})

module.exports = connect(mapStateToProps)(LoginScreen)

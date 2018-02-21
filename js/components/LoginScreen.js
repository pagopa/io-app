/**

 * @flow
 */

'use strict'

const React = require('React')
const { connect } = require('react-redux')

import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Keyboard,
  Animated
} from 'react-native'

import I18n from '../i18n'

import { H1, H2, Button } from 'native-base'

import type { Navigator } from 'react-navigation'
import type { Dispatch } from '../actions/types'
import type { DefaultLoggedOutUserState } from '../reducers/user'

import { SpidLoginButton } from './SpidLoginButton'
import SpidSubscribeComponent from './SpidSubscribeComponent'

import { CommonStyles } from './styles'

import { logInIntent, selectIdp, logIn, logInError } from '../actions'

import { ROUTES, VERSION } from '../utils/constants'

import { isDemoIdp } from '../utils/api'

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

/**
 * Implements the login screen.
 */
class LoginScreen extends React.Component {
  // called when keyboard appears
  keyboardWillShowSub: any => void
  // called when keyboard disappears
  keyboardWillHideSub: any => void

  props: {
    navigation: Navigator,
    dispatch: Dispatch,
    isConnected: boolean,
    userState: DefaultLoggedOutUserState
  }

  state: {
    imageHeight: any
  }

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

  handleIpdSelection = idp => {
    // if the selected idp is the demo one simulate a sucessfull login
    if (isDemoIdp(idp)) {
      this.props.dispatch(selectIdp(idp))
      this.props.dispatch(logIn('demo', idp.id))
      this.props.navigation.navigate(ROUTES.PROFILE)
    } else {
      this.props.dispatch(selectIdp(idp))
    }
  }

  render() {
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
          userState={this.props.userState}
          onSelectIdp={idp => this.handleIpdSelection(idp)}
          onSpidLoginIntent={() => this.props.dispatch(logInIntent())}
          onSpidLogin={(token, idpId) => {
            this.props.dispatch(logIn(token, idpId))
            this.props.navigation.navigate(ROUTES.PROFILE)
          }}
          onSpidLoginError={error => {
            this.props.dispatch(logInError(error))
          }}
        />
        <View style={{ height: 10 }} />
        <SpidSubscribeComponent />
        <View style={{ height: 30 }} />
        <Button
          transparent
          block
          onPress={() => this.props.navigation.navigate(ROUTES.NO_SPID)}
        >
          <Text style={StyleSheet.flatten(CommonStyles.textButton)}>
            {I18n.t('login.spidInfoButton')}
          </Text>
        </Button>
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

const mapStateToProps = state => ({
  isConnected: state.network.isConnected,
  userState: state.user
})

module.exports = connect(mapStateToProps)(LoginScreen)

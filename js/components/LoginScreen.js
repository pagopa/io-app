/**
 * Implements the login screen.
 *
 * @providesModule LoginScreen
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
  Animated,
} from 'react-native'

import {
  H1, H2,
} from 'native-base'

import type { Navigator } from 'react-navigation'

import type { Dispatch } from '../actions/types'

import { SpidLoginButton } from './SpidLoginButton'
import SpidSubscribeComponent from './SpidSubscribeComponent'

import { logInIntent, selectIdp, selectDemo, logIn, logInDemo, logInError } from '../actions'

import { ROUTES, VERSION } from '../utils/constants'

// Due to a bug, the following style must be wrapped
// with a call to StyleSheet.flatten()
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'center',
    color: '#fff',
  },
  version: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
})

const titleTextStyles = StyleSheet.flatten(styles.titleText)

// height of the logo at start and end of the animation
// that makes space for the keyboard when inputing the
// user email
const ANIMATION_START_LOGO_HEIGHT = 70
const ANIMATION_END_LOGO_HEIGHT = 0

class LoginScreen extends React.Component {

  // called when keyboard appears
  keyboardWillShowSub: (any) => void
  // called when keyboard disappears
  keyboardWillHideSub: (any) => void

  props: {
		navigation: Navigator,
		dispatch: Dispatch,
  }

  state: {
    imageHeight: any,
  }

  constructor(props) {
    super(props)
    this.state = {
      imageHeight: new Animated.Value(ANIMATION_START_LOGO_HEIGHT)
    }
  }

  componentWillMount () {
    // setup keyboard event handlers
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
  }

  componentWillUnmount() {
    // remove keyboard event handlers
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
  }

  // when keyboard appears, we shrink the logo
  keyboardWillShow = (event) => {
    Animated.timing(this.state.imageHeight, {
      duration: event.duration,
      toValue: ANIMATION_END_LOGO_HEIGHT,
    }).start()
  }

  // when keyboard disappears we expand the logo to original size
  keyboardWillHide = (event) => {
    Animated.timing(this.state.imageHeight, {
      duration: event.duration,
      toValue: ANIMATION_START_LOGO_HEIGHT,
    }).start()
  }

  render() {
    return(
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
          <View style={{ height: 20 }} />
          <Animated.Image source={require('../../img/logo-it.png')} style={[{
            resizeMode: 'contain',
          }, {height: this.state.imageHeight}]}/>
        <View style={{ height: 100, paddingTop: 20, }}>
            <H2 style={titleTextStyles}>benvenuto nella tua</H2>
            <H1 style={titleTextStyles}>Cittadinanza Digitale</H1>
          </View>
          <SpidLoginButton
						onSelectIdp={(idp) => this.props.dispatch(selectIdp(idp))}
            onSelectDemo={(idp) => this.props.dispatch(selectDemo(idp))}
						onSpidLoginIntent={() => this.props.dispatch(logInIntent())}
            onSpidLogin={(token, idpId) => {
              this.props.dispatch(logIn(token, idpId))
              this.props.navigation.navigate(ROUTES.PROFILE)
            }}
            onSpidLoginError={(error) => {
              this.props.dispatch(logInError(error))
            }}
            onProceedSpidLoginDemo={() => {
              this.props.dispatch(
                logInDemo({
                  token: 'demo',
                  spid_idp: 'demo',
                  name: 'utente',
                  familyname: 'demo',
                  fiscalnumber: 'TNTDME00A01H501K',
                  mobilephone: '06852641',
                  email: 'demo@gestorespid.it',
                })
              )
              this.props.navigation.navigate(ROUTES.PROFILE)
            }}
            onCancelSpidLoginDemo={() => {
              this.props.navigation.navigate(ROUTES.HOME)
            }}
					/>
          <View style={{ height: 10 }} />
          <SpidSubscribeComponent />
          <View style={{ height: 60 }} />
          <View style={styles.version}>
            <Text style={titleTextStyles}>Version {VERSION}</Text>
          </View>
				</KeyboardAvoidingView>
    )
  }
}

module.exports = connect()(LoginScreen)

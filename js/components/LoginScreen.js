/**
 * Implements the login screen
 *
 * @providesModule LoginScreen
 * @flow
 */

'use strict'

const React = require('React')
const { connect } = require('react-redux')

import {
	StyleSheet,
  Image,
} from 'react-native'

import {
  Button,
  Text,
  H1, H2,
	Grid,
	Row,
	Col,
} from 'native-base'

import type { Navigator } from 'react-navigation'
import type { Dispatch } from '../actions/types'

import { SpidLoginButton } from './SpidLoginButton'

const {
	logIn,
} = require('../actions')

// Due to a bug, the following style must be wrapped
// with a call to StyleSheet.flatten()
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
  container: {
    padding: 30,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#0066CC',
  },
  titleContainer: {
    justifyContent: 'center',
  },
  titleText: {
    // fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
})

class LoginScreen extends React.Component {

  props: {
		navigation: Navigator,
		dispatch: Dispatch,
  };

  render() {
    return(
				<Grid style={styles.container}>
					<Row size={1}>
						<Col>
              <Image source={require('../../img/logo-it.png')} style={{
                width: '100%',
                height: 100,
                marginBottom: 20,
                resizeMode: 'contain',
              }}/>
							<H2 style={StyleSheet.flatten(styles.titleText)}>benvenuto nella tua</H2>
							<H1 style={StyleSheet.flatten(styles.titleText)}>Cittadinanza Digitale</H1>
						</Col>
					</Row>
					<Row size={1}>
						<Col>
							<SpidLoginButton onSpidLogin={(token, idpId) => {
  this.props.dispatch(logIn(token, idpId))
  this.props.navigation.navigate('Profile')
}} />
              <Button small transparent>
                <Text style={{fontSize: 15, color: '#b6d4f2', marginTop: 10}}>Non hai ancora SPID?</Text>
              </Button>
						</Col>
					</Row>
				</Grid>
    )
  }
}

module.exports = connect()(LoginScreen)

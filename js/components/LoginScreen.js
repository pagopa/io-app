/**
 * @providesModule LoginScreen
 * @flow
 */

'use strict';

const React = require('React');
const { connect } = require('react-redux');

import {
	StyleSheet,
	Image,
  View,
	Platform,
} from 'react-native';

import {
  Container,
  Content,
  Button,
  Text,
  H1, H2, H3,
  List,
  ListItem,
  Right,
  Icon,
} from 'native-base';

import { Col, Row, Grid } from "react-native-easy-grid";

import type { Action } from '../actions/types';

import { TitilliumRegular } from './fonts';

import SpidLoginButton from './SpidLoginButton';

const {
	loginWithIdp,
} = require('../actions');

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
	container: {
		padding: 30,
		paddingTop: 40,
		paddingBottom: 20,
		//backgroundColor: '#0066CC',
	},
  titleContainer: {
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: TitilliumRegular,
    // fontWeight: '600',
    textAlign: 'center',
    color: '#0066CC',
  },
});

class LoginScreen extends React.Component {

  props: {
    dispatch: (action: Action) => void,
  };

  render() {
    return(
				<Grid style={styles.container}>
					<Row size={2}>
						<Col>
							<H2 style={StyleSheet.flatten(styles.titleText)}>benvenuto nella tua</H2>
							<H1 style={StyleSheet.flatten(styles.titleText)}>Cittadinanza Digitale</H1>
						</Col>
					</Row>
					<Row size={1}>
						<Col>
							<SpidLoginButton />
						</Col>
					</Row>
					<Row size={1}>
						<Col>
							<Button block small style={{backgroundColor: '#013366'}}>
								<Text>Non hai SPID?</Text>
							</Button>
						</Col>
					</Row>
				</Grid>
    );
  }
}

module.exports = connect()(LoginScreen);

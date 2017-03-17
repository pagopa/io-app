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
import type { IdentityProvider } from '../types';

const {
	loginWithIdp,
} = require('../actions');

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
    width: undefined,
    height: undefined,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'stretch',
		resizeMode: 'cover',
	},
	container: {
		margin: 20,
		marginTop: 20,
		marginBottom: 20,
		padding: 30,
		paddingTop: 40,
		paddingBottom: 20,
		backgroundColor: '#0066CCC0',
	},
  titleContainer: {
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: (Platform.OS === 'ios') ? 'Titillium Web' : 'Titillium Web_Regular',
    // fontWeight: '600',
    textAlign: 'center',
    color: '#ffffff',
  },
	spidText: {
		lineHeight: 50,
		fontSize: 20,
		textAlign: 'right',
		color: '#ffffff',
	},
	spidLogo: {
		height: 54,
		width: 70,
		resizeMode: 'contain',
	},
	idpButton: {
		backgroundColor: '#fff',
		justifyContent: 'space-between',
	},
	idpName: {
		color: '#0066CC',
		fontSize: 15,
	},
  idpLogo: {
    width: 80,
    height: 20,
    resizeMode: 'contain',
  }
});

class LoginScreen extends React.Component {

  props: {
    idps: Array<IdentityProvider>,
		dispatch: (action: Action) => void;
  };

	createButtons() {
		return this.props.idps.map((idp: IdentityProvider) => {
			return (<Row key={idp.id} size={1}><Col>
				<Button light block style={StyleSheet.flatten(styles.idpButton)} onPress={(e) => {
					this.props.dispatch(loginWithIdp(idp));
				}}>
					<Image
						source={idp.logo}
						style={styles.idpLogo}
					/>
				<Text style={StyleSheet.flatten(styles.idpName)}>{idp.name}</Text>
			</Button></Col></Row>
			);
		})
	}

  render() {
    return(
			<Image source={require('../../img/yoal-desurmont-90497.jpg')} resizeMode='contain' style={styles.backdrop}>
				<Grid style={styles.container}>
					<Row size={2}>
						<Col>
							<H2 style={StyleSheet.flatten(styles.titleText)}>benvenuto nella tua</H2>
							<H1 style={StyleSheet.flatten(styles.titleText)}>Cittadinanza Digitale</H1>
						</Col>
					</Row>
					<Row size={8}>
						<Col>
						<Row size={1} style={{justifyContent: 'center'}}>
							<Text style={StyleSheet.flatten(styles.spidText)}>Scegli il tuo provider</Text>
							<Image source={require('../../img/spid.png')} style={styles.spidLogo} />
						</Row>
						{this.createButtons()}
						</Col>
					</Row>
					<Row size={1}>
					</Row>
					<Row size={1}>
						<Col>
							<Button block style={{backgroundColor: '#013366'}}>
								<Text>Non hai SPID?</Text>
							</Button>
						</Col>
					</Row>
				</Grid>

			</Image>
    );
  }
}

module.exports = connect()(LoginScreen);

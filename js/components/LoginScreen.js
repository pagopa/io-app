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
} from 'react-native';

import {
  Container,
  Content,
  Button,
  Text,
  H1,
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
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#06F'
  },
  titleText: {
    fontFamily: 'Helvetica Neue',
    fontWeight: '300',
    textAlign: 'center',
    color: '#ffffff',
  },
  idpList: {
    // padding: 20,
  },
  idpLogo: {
    flex: 1,
    height: 30,
    resizeMode: 'contain',
  }
});

class LoginScreen extends React.Component {

  props: {
    idps: Array<IdentityProvider>,
		dispatch: (action: Action) => void;
  };

  render() {
    return(
      <Grid>
        <Row>
          <View style={styles.titleContainer}>
            <H1 style={StyleSheet.flatten(styles.titleText)}>CITTADINANZA</H1>
            <H1 style={StyleSheet.flatten(styles.titleText)}>DIGITALE</H1>
          </View>
        </Row>
        <Row style={{minHeight: 300}}>
          <List dataArray={this.props.idps} renderRow={(idp) =>
            <ListItem button onPress={(e) => {
							this.props.dispatch(loginWithIdp(idp.id));
						}}>
              <Image
                source={idp.logo}
                style={styles.idpLogo}
              ></Image>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
          }/>
        </Row>
      </Grid>
    );
  }
}

module.exports = connect()(LoginScreen);

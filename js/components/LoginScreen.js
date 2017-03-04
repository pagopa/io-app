/**
 * @providesModule LoginScreen
 * @flow
 */

'use strict';

var React = require('React');

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
} from 'native-base';

import { Col, Row, Grid } from "react-native-easy-grid";

const idps = [
  {
    logo: require('./img/spid-idp-infocertid.png')
  },
  {
    logo: require('./img/spid-idp-posteid.png'),
  },
  {
    logo: require('./img/spid-idp-sielteid.png'),
  },
  {
    logo: require('./img/spid-idp-timid.png'),
  },
  {
    logo: require('./img/spid-idp-arubaid.png'),
  },
];

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#06F'
  },
  titleText: {
    fontFamily: "HelveticaNeue-Light, Roboto",
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
          <List dataArray={idps} renderRow={(idp) =>
            <ListItem>
              <Image
                source={idp.logo}
                style={styles.idpLogo}
              ></Image>
            </ListItem>
          } />
        </Row>
      </Grid>
    );
  }
}

module.exports = LoginScreen;

/**
 * @providesModule ProfileScreen
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
  Header,
  Content,
  Button,
  Text,
  H2,
  List,
  ListItem,
  Right,
  Icon,
} from 'native-base';
import { Col, Row, Grid } from "react-native-easy-grid";
import type { Action } from '../actions/types';
import type { UserState } from '../reducers/user';

const {
	logOut,
} = require('../actions');

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
});

class ProfileScreen extends React.Component {

  props: {
    dispatch: (action: Action) => void;
    user: UserState;
  };

  render() {
    return(
      <Container>
        <Header>
          <H2>{this.props.user.name}</H2>
        </Header>
        <Content>
          <Button onPress={() => this.props.dispatch(logOut()) }>
            <Text>Logout</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}


function select(store) {
  return {
    user: store.user,
  };
}

module.exports = connect(select)(ProfileScreen);

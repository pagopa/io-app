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
	Platform,
} from 'react-native';
import {
  Container,
  Header,
  Content,
  Button,
  Body,
	Title,
  H1,
  List,
  ListItem,
  Right,
  Icon,
	Text,
} from 'native-base';
import { Col, Row, Grid } from "react-native-easy-grid";
import type { Action } from '../actions/types';
import type { UserState } from '../reducers/user';

const {
	logOut,
} = require('../actions');


const titilliumFontFamily = (Platform.OS === 'ios') ? 'Titillium Web' : 'Titillium Web_Regular';

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
	header: {
		fontSize: 25,
		fontFamily: titilliumFontFamily,
	},
	listItemHeader: {
		fontFamily: titilliumFontFamily,
	},
	listItem: {
		color: '#06C',
		fontWeight: 'bold',
		fontFamily: titilliumFontFamily,
		marginLeft: 20,
	},
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
					<Body>
						<Title style={StyleSheet.flatten(styles.header)}>{this.props.user.name}</Title>
					</Body>
			</Header>
        <Content>
					<ListItem itemHeader first>
	            <Text style={StyleSheet.flatten(styles.listItemHeader)}>INFORMAZIONI PERSONALI</Text>
	        </ListItem>
	        <ListItem>
	            <Text style={StyleSheet.flatten(styles.listItem)}>Domicilio e Residenza</Text>
	        </ListItem>
	        <ListItem>
	            <Text style={StyleSheet.flatten(styles.listItem)}>Stato di Famiglia</Text>
	        </ListItem>

	        <ListItem itemHeader>
	            <Text style={StyleSheet.flatten(styles.listItemHeader)}>AVVISI</Text>
	        </ListItem>
	        <ListItem>
	            <Text style={StyleSheet.flatten(styles.listItem)}>Gestione Avvisi</Text>
	        </ListItem>
          <Button light onPress={() => this.props.dispatch(logOut()) }>
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

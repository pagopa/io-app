/**
 * @providesModule ProfileComponent
 * @flow
 */

'use strict';

const React = require('React');
import {
	StyleSheet
} from 'react-native';
import {
  Content,
  Button,
  Body,
	Title,
  H1,
  List,
  ListItem,
  Icon,
	Text,
} from 'native-base';
import type { Action } from '../actions/types';
import type { UserState } from '../reducers/user';

import { ProfileStyles } from './styles';

const {
	logOut,
} = require('../actions');

class ProfileComponent extends React.Component {

  props: {
    dispatch: (action: Action) => void;
    user: UserState;
  };

  render() {
    return(
      <Content padder>
  			<ListItem itemHeader first>
            <Text style={StyleSheet.flatten(ProfileStyles.listItemHeader)}>INFORMAZIONI PERSONALI</Text>
        </ListItem>
        <ListItem>
            <Text style={StyleSheet.flatten(ProfileStyles.listItem)}>Domicilio e Residenza</Text>
        </ListItem>
        <ListItem>
            <Text style={StyleSheet.flatten(ProfileStyles.listItem)}>Stato di Famiglia</Text>
        </ListItem>
				<ListItem itemHeader first>
            <Text style={StyleSheet.flatten(ProfileStyles.listItemHeader)}>DOMICILIO PEC</Text>
        </ListItem>
        <ListItem>
            <Text style={StyleSheet.flatten(ProfileStyles.listItem)}>pinco@pec.italia.it</Text>
        </ListItem>

      </Content>
    );
  }
}

module.exports = ProfileComponent;

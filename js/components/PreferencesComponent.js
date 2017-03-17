/**
 * @providesModule PreferencesComponent
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

class PreferencesComponent extends React.Component {

  props: {
    dispatch: (action: Action) => void;
    user: UserState;
  };

  render() {
    return(
      <Content padder>
        <ListItem itemHeader first>
            <Text style={StyleSheet.flatten(ProfileStyles.listItemHeader)}>AVVISI</Text>
        </ListItem>
        <ListItem>
            <Text style={StyleSheet.flatten(ProfileStyles.listItem)}>Gestione Avvisi</Text>
        </ListItem>
  			<ListItem itemHeader>
            <Text style={StyleSheet.flatten(ProfileStyles.listItemHeader)}>ESCI DALL'APPLICAZIONE</Text>
        </ListItem>
        <ListItem>
  				<Button
  					light block
  					onPress={() => this.props.dispatch(logOut()) }>
  					<Text>Torna all'accesso SPID</Text>
  				</Button>
  			</ListItem>
      </Content>
    );
  }
}

module.exports = PreferencesComponent;

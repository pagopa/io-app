/**
 * @providesModule PreferencesComponent
 * @flow
 */

'use strict'

const React = require('React')
import {
	StyleSheet
} from 'react-native'
import {
  Content,
  Button,
  Body,
	ListItem,
  Text,
	Right,
	Switch,
} from 'native-base'

import { NavigationActions } from 'react-navigation'

import type { Navigator } from 'react-navigation'

import type { Action } from '../actions/types'
import type { UserState } from '../reducers/user'

import { ProfileStyles } from './styles'

const {
	logOut,
} = require('../actions')

const resetNavigationAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Home'})
  ]
})

class PreferencesComponent extends React.Component {

  props: {
		navigation: Navigator,
    dispatch: (action: Action) => void,
    user: UserState,
  };

  render() {
    return(
      <Content padder>
        <ListItem itemHeader first>
            <Text style={StyleSheet.flatten(ProfileStyles.listItemHeader)}>RICEZIONE AVVISI</Text>
        </ListItem>
				<ListItem>
					<Body>
						<Text>Scadenze amministrative</Text>
					</Body>
					<Right>
							<Switch value={false} />
					</Right>
        </ListItem>
				<ListItem>
					<Body>
						<Text>Avvisi di pagamento</Text>
					</Body>
					<Right>
							<Switch value={false} />
					</Right>
        </ListItem>
        <ListItem>
					<Body>
						<Text>Scadenze fiscali</Text>
					</Body>
					<Right>
							<Switch value={false} />
					</Right>
        </ListItem>
				<ListItem itemHeader>
            <Text style={StyleSheet.flatten(ProfileStyles.listItemHeader)}>ESCI DALL'APPLICAZIONE</Text>
        </ListItem>
        <ListItem>
					<Button
						warning block
						onPress={() => {
  this.props.dispatch(logOut())
  this.props.navigation.dispatch(resetNavigationAction)
}}>
						<Text>Torna allo schermo di Login</Text>
					</Button>
				</ListItem>
      </Content>
    )
  }
}

module.exports = PreferencesComponent

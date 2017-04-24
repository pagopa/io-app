/**
 * @providesModule ProfileComponent
 * @flow
 */

'use strict'

const React = require('React')
import {
	StyleSheet
} from 'react-native'
import {
  Content,
  ListItem,
  Text,
  Left, Right,
  H1, H2, H3,
  Icon,
  Button,
  Body,
  Switch,
  Badge,
} from 'native-base'

import { NavigationActions } from 'react-navigation'

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

class ProfileComponent extends React.Component {

  props: {
    navigation: Navigator,
    dispatch: (action: Action) => void;
    user: UserState;
  };

  render() {
    const profile = this.props.user.profile
    return(
      <Content>
        <ListItem itemDivider />
        <ListItem itemHeader icon>
            <Left>
              <Icon name="user" />
            </Left>
            <Body>
              <Text>PROFILO SPID</Text>
            </Body>
            <Right>
              <Button transparent dark iconRight>
                <Icon name="cog" style={{fontSize: 18}}/>
              </Button>
            </Right>
        </ListItem>
				<ListItem>
            <Left><Text>Nome</Text></Left>
            <Text style={StyleSheet.flatten(ProfileStyles.listItem)}>{ profile ? profile.name : '-' } { profile ? profile.familyname : '-' }</Text>
        </ListItem>
        <ListItem>
            <Left><Text>CF</Text></Left>
            <Text style={StyleSheet.flatten(ProfileStyles.listItem)}>{ profile ? profile.fiscalnumber : '-' }</Text>
        </ListItem>
        <ListItem>
            <Left><Text>Email</Text></Left>
            <Text style={StyleSheet.flatten(ProfileStyles.listItem)}>{ profile ? profile.email : '-' }</Text>
        </ListItem>
        <ListItem>
            <Left><Text>Cellulare</Text></Left>
            <Text style={StyleSheet.flatten(ProfileStyles.listItem)}>{ profile ? profile.mobilephone : '-' }</Text>
        </ListItem>
        <ListItem itemDivider />
				<ListItem itemHeader first icon>
          <Left><Icon name="newsletter" /></Left>
          <Body><Text>DOMICILIO PEC</Text></Body>
        </ListItem>
        <ListItem>
          <Body><Text>pinco@pec.italia.it</Text></Body>
          <Right>
            <Button transparent iconRight dark>
              <Icon active name="chevron-right" />
            </Button>
          </Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem itemHeader first icon>
          <Left><Icon name="notification" /></Left>
          <Body><Text>RICEZIONE AVVISI</Text></Body>
        </ListItem>
        <ListItem>
					<Body>
						<Text>Enti abilitati</Text>
					</Body>
					<Right>
						<Button transparent iconRight dark>
              <Text>5</Text>
              <Icon active name="chevron-right" />
            </Button>
					</Right>
        </ListItem>
				<ListItem>
					<Body>
						<Text>Scadenze amministrative</Text>
					</Body>
					<Right>
						<Switch value={true} />
					</Right>
        </ListItem>
				<ListItem>
					<Body>
						<Text>Avvisi di pagamento</Text>
					</Body>
					<Right>
						<Switch value={true} />
					</Right>
        </ListItem>
        <ListItem>
					<Body>
						<Text>Scadenze fiscali</Text>
					</Body>
					<Right>
						<Switch value={true} />
					</Right>
        </ListItem>

        <ListItem itemDivider />

          <ListItem itemHeader first icon>
            <Left><Icon name="log-out" /></Left>
            <Body><Text>ESCI</Text></Body>
          </ListItem>
          <ListItem>
<Button warning block onPress={() => {
  this.props.dispatch(logOut())
  this.props.navigation.dispatch(resetNavigationAction)
}}>
            <Text>Torna alla Login SPID</Text>
          </Button>
        </ListItem>
      </Content>
    )
  }
}

module.exports = ProfileComponent

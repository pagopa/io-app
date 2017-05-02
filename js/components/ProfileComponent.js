/**
 * @providesModule ProfileComponent
 * @flow
 */

'use strict'

const React = require('React')

import {
	StyleSheet,
  Linking,
} from 'react-native'

import {
  Content,
  ListItem,
  Text,
  Left, Right,
  Icon,
  Button,
  Body,
  Switch,
} from 'native-base'

import { NavigationActions } from 'react-navigation'

import type { Dispatch } from '../actions/types'
import type { LoggedInUserState } from '../reducers/user'

import { ProfileStyles } from './styles'

import { getIdpInfo } from './SpidLoginButton'

const {
	logOut,
} = require('../actions')

const resetNavigationAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Home'})
  ]
})

const openIdpProfile = function (idpUrl: string) {
  Linking.openURL(idpUrl).catch(err => {
    // TODO handle error
  })
}

class ProfileComponent extends React.Component {

  props: {
    navigation: Navigator,
    dispatch: Dispatch,
    user: LoggedInUserState,
  };

  render() {
    const profile = this.props.user.profile
    const idpId = this.props.user.idpId
    const idpInfo = getIdpInfo(idpId)

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
            { idpInfo && idpInfo.profileUrl != undefined &&
              <Right>
                <Button transparent dark iconRight onPress={() => {
                  openIdpProfile(idpInfo.profileUrl)
                }}>
                  <Icon name="cog" style={{fontSize: 18}}/>
                </Button>
              </Right>
            }
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
        <ListItem>
            <Left><Text>Gestore</Text></Left>
            <Text>{ idpInfo ? idpInfo.name : '-' }</Text>
        </ListItem>
        <ListItem itemDivider />
				<ListItem itemHeader first icon>
          <Left><Icon name="newsletter" /></Left>
          <Body><Text>DOMICILIO PEC</Text></Body>
        </ListItem>
        <ListItem>
          <Body><Text>pinco@pec.italia.it</Text></Body>
          <Right>
            <Icon active name="chevron-right" />
          </Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem itemHeader first icon>
          <Left><Icon name="notification" /></Left>
          <Body><Text>AVVISI E SCADENZE</Text></Body>
        </ListItem>
        <ListItem icon>
          <Left></Left>
					<Body>
						<Text>Enti abilitati</Text>
					</Body>
					<Right>
            <Text>5</Text>
            <Icon name="chevron-right" />
					</Right>
        </ListItem>
        <ListItem icon>
          <Left></Left>
					<Body>
						<Text>Tipologie</Text>
					</Body>
					<Right>
            <Text>6</Text>
            <Icon name="chevron-right" />
					</Right>
        </ListItem>
        <ListItem>
					<Body>
						<Text>Aggiungi al calendario</Text>
					</Body>
					<Right>
						<Switch value={true} />
					</Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem>
          <Body>
<Button iconRight danger block onPress={() => {
  this.props.dispatch(logOut())
  this.props.navigation.dispatch(resetNavigationAction)
}}>
              <Text>Esci da questa identità SPID</Text>
              <Icon name="log-out" />
            </Button>
          </Body>
        </ListItem>
      </Content>
    )
  }
}

module.exports = ProfileComponent

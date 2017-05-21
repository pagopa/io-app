/**
 * Implements the content of the user profile tab.
 *
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
  Grid,
  Row,
  Col,
} from 'native-base'

import { NavigationActions } from 'react-navigation'

import type { NavigationScreenProp } from 'react-navigation/src/TypeDefinition'
import type { Dispatch, AnyAction } from '../actions/types'
import type { LoggedInUserState } from '../reducers/user'

import { ProfileStyles } from './styles'

import { getIdpInfo } from './SpidLoginButton'

const {
	logOut,
} = require('../actions')

/**
 * Resets the main navigation to the Home screen
 */
const resetNavigationAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Home'})
  ]
})

/**
 * Opens the IdP profile page as an external link.
 *
 * This usually triggers the switch to the web browser
 * configured on the os.
 * TODO handle the error thrown by openURL
 * TODO we could check whether a specific IdP app is installed
 *      and switch to that.
 */
const openIdpProfile = function (idpUrl: string) {
  Linking.openURL(idpUrl) //.catch(err => { })
}

class ProfileComponent extends React.Component {

  props: {
    navigation: NavigationScreenProp<*,AnyAction>,
    dispatch: Dispatch,
    user: LoggedInUserState,
  }

  render() {
    const profile = this.props.user.profile
    const idpId = this.props.user.idpId
    const idpInfo = getIdpInfo(idpId)

    const name = profile && profile.name ? profile.name : ''
    const familyName = profile && profile.familyname ? profile.familyname : '-'
    const fullName = `${name} ${familyName}`
    const fiscalNumber = profile && profile.fiscalnumber ? profile.fiscalnumber.replace('TINIT-', '') : '-'
    const email = profile && profile.email ? profile.email : '-'
    const mobilePhone = profile && profile.mobilephone ? profile.mobilephone : '-'

    return(
      <Content>
        <ListItem first last style={StyleSheet.flatten(ProfileStyles.profileHeader)}>
          <Body>
            <Grid>
              <Row height={50}>
                <Col><Text style={StyleSheet.flatten(ProfileStyles.profileHeaderText)}>{ fullName.toUpperCase() }</Text></Col>
              </Row>
              <Row>
                <Col style={StyleSheet.flatten(ProfileStyles.profileRow)}>
                  <Icon name="user" style={StyleSheet.flatten(ProfileStyles.profileRowIcon)}/>
                  <Text style={StyleSheet.flatten(ProfileStyles.profileRowText)}>{ fiscalNumber }</Text>
                </Col>
              </Row>
              <Row>
                <Col style={StyleSheet.flatten(ProfileStyles.profileRow)}>
                  <Icon name="email" style={StyleSheet.flatten(ProfileStyles.profileRowIcon)}/>
                  <Text style={StyleSheet.flatten(ProfileStyles.profileRowText)}>{ email }</Text>
                </Col>
              </Row>
              <Row>
                <Col style={StyleSheet.flatten(ProfileStyles.profileRow)}>
                  <Icon name="mobile" style={StyleSheet.flatten(ProfileStyles.profileRowIcon)}/>
                  <Text style={StyleSheet.flatten(ProfileStyles.profileRowText)}>{ mobilePhone }</Text>
                </Col>
              </Row>
            </Grid>
          </Body>
        </ListItem>

        <ListItem itemDivider />

        <ListItem itemHeader first>
          <Text style={StyleSheet.flatten(ProfileStyles.preferenceHeaderText)}>PROFILO SPID</Text>
        </ListItem>
        <ListItem icon last onPress={() => {
          if(idpInfo && idpInfo.profileUrl) {
            openIdpProfile(idpInfo.profileUrl)
          }
        }}>
          <Body>
            <Text>{ idpInfo ? idpInfo.name : 'SCONOSCIUTO' }</Text>
          </Body>
          <Right>
            <Icon name="chevron-right" style={{fontSize: 18}}/>
          </Right>
        </ListItem>

        <ListItem itemDivider />

				<ListItem itemHeader first>
          <Text style={StyleSheet.flatten(ProfileStyles.preferenceHeaderText)}>DOMICILIO PEC</Text>
        </ListItem>
        <ListItem icon last onPress={() => {
          this.props.navigation.navigate('DigitalAddress')
        }}>
          <Body><Text>pinco@pec.italia.it</Text></Body>
          <Right>
            <Icon active name="chevron-right" />
          </Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem itemHeader first>
          <Text style={StyleSheet.flatten(ProfileStyles.preferenceHeaderText)}>AVVISI E SCADENZE</Text>
        </ListItem>
        <ListItem icon onPress={() => {
          this.props.navigation.navigate('SenderSelection')
        }}>
          <Body>
						<Text>Enti abilitati</Text>
					</Body>
					<Right>
            <Text>5</Text>
            <Icon name="chevron-right" />
					</Right>
        </ListItem>
        <ListItem icon onPress={() => {
          this.props.navigation.navigate('TopicsSelection')
        }}>
          <Body>
						<Text>Tipologie</Text>
					</Body>
					<Right>
            <Text>6</Text>
            <Icon name="chevron-right" />
					</Right>
        </ListItem>
        <ListItem icon last>
					<Body>
						<Text>Aggiungi al calendario</Text>
					</Body>
					<Right>
						<Switch value={true} />
					</Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem first last icon onPress={() => {
          this.props.dispatch(logOut())
          this.props.navigation.dispatch(resetNavigationAction)
        }}>
          <Body>
            <Text style={{color: '#e00'}}>Esci da questa identità SPID</Text>
          </Body>
          <Right>
            <Icon style={{color: '#e99'}} name="log-out" />
          </Right>
        </ListItem>
      </Content>
    )
  }
}

module.exports = ProfileComponent

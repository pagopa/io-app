/**
 * Implements the content of the user profile tab.
 *
 * @providesModule ProfileComponent
 * @flow
 */

'use strict'

const React = require('React')

import { StyleSheet, Linking } from 'react-native'

import {
  Content,
  ListItem,
  View,
  Text,
  Right,
  Icon,
  Body,
  Switch,
  Grid,
  Row,
  Col
} from 'native-base'

import { NavigationActions } from 'react-navigation'

import type { NavigationScreenProp } from 'react-navigation/src/TypeDefinition'
import type { Dispatch, AnyAction } from '../actions/types'
import type { LoggedInUserState } from '../reducers/user'

import { ROUTES, VERSION } from '../utils/constants'

import { ProfileStyles } from './styles'

import { getIdpInfo } from './SpidLoginButton'

const profileRowStyles = StyleSheet.flatten(ProfileStyles.profileRow)
const profileHeaderStyles = StyleSheet.flatten(ProfileStyles.profileHeader)
const profileHeaderTextStyles = StyleSheet.flatten(
  ProfileStyles.profileHeaderText
)
const preferenceHeaderTextStyles = StyleSheet.flatten(
  ProfileStyles.preferenceHeaderText
)
const profileRowIconStyles = StyleSheet.flatten(ProfileStyles.profileRowIcon)
const profileRowTextStyles = StyleSheet.flatten(ProfileStyles.profileRowText)

const { logOut } = require('../actions')

/**
 * Resets the main navigation to the Home screen
 */
const resetNavigationAction = NavigationActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: ROUTES.HOME })]
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
const openIdpProfile = function(idpUrl: string) {
  Linking.openURL(idpUrl) //.catch(err => { })
}

class ProfileComponent extends React.Component {
  props: {
    navigation: NavigationScreenProp<*, AnyAction>,
    dispatch: Dispatch,
    user: LoggedInUserState
  }

  render() {
    const profile = this.props.user.profile
    const idpId = this.props.user.idpId
    const idpInfo = getIdpInfo(idpId)

    const name = profile && profile.name ? profile.name : ''
    const familyName = profile && profile.familyname ? profile.familyname : '-'
    const fullName = `${name} ${familyName}`
    const fiscalNumber =
      profile && profile.fiscalnumber
        ? profile.fiscalnumber.replace('TINIT-', '')
        : '-'
    const email = profile && profile.email ? profile.email : '-'
    const mobilePhone =
      profile && profile.mobilephone ? profile.mobilephone : '-'

    return (
      <Content>
        <ListItem first last style={profileHeaderStyles}>
          <Body>
            <Grid>
              <Row height={50}>
                <Col>
                  <Text style={profileHeaderTextStyles}>
                    {fullName.toUpperCase()}
                  </Text>
                </Col>
              </Row>
              <Row>
                <Col style={profileRowStyles}>
                  <Icon name="user" style={profileRowIconStyles} />
                  <Text style={profileRowTextStyles}>{fiscalNumber}</Text>
                </Col>
              </Row>
              <Row>
                <Col style={profileRowStyles}>
                  <Icon name="email" style={profileRowIconStyles} />
                  <Text style={profileRowTextStyles}>{email}</Text>
                </Col>
              </Row>
              <Row>
                <Col style={profileRowStyles}>
                  <Icon name="mobile" style={profileRowIconStyles} />
                  <Text style={profileRowTextStyles}>{mobilePhone}</Text>
                </Col>
              </Row>
            </Grid>
          </Body>
        </ListItem>

        <ListItem itemDivider />

        <ListItem itemHeader first>
          <Text style={preferenceHeaderTextStyles}>PROFILO SPID</Text>
        </ListItem>
        <ListItem
          icon
          last
          onPress={() => {
            if (idpInfo && idpInfo.profileUrl) {
              openIdpProfile(idpInfo.profileUrl)
            }
          }}
        >
          <Body>
            <Text>{idpInfo ? idpInfo.name : 'SCONOSCIUTO'}</Text>
          </Body>
          <Right>
            <Icon name="chevron-right" style={{ fontSize: 18 }} />
          </Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem itemHeader first>
          <Text style={preferenceHeaderTextStyles}>DOMICILIO PEC</Text>
        </ListItem>
        <ListItem
          icon
          last
          onPress={() => {
            this.props.navigation.navigate(ROUTES.DIGITAL_ADDRESS)
          }}
        >
          <Body>
            <Text>pinco@pec.italia.it</Text>
          </Body>
          <Right>
            <Icon active name="chevron-right" />
          </Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem itemHeader first>
          <Text style={preferenceHeaderTextStyles}>AVVISI E SCADENZE</Text>
        </ListItem>
        <ListItem
          icon
          onPress={() => {
            this.props.navigation.navigate(ROUTES.SENDER_SELECTION)
          }}
        >
          <Body>
            <Text>Enti abilitati</Text>
          </Body>
          <Right>
            <Text>5</Text>
            <Icon name="chevron-right" />
          </Right>
        </ListItem>
        <ListItem
          icon
          onPress={() => {
            this.props.navigation.navigate(ROUTES.TOPICS_SELECTION)
          }}
        >
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

        <ListItem
          first
          last
          icon
          onPress={() => {
            this.props.dispatch(logOut())
            this.props.navigation.dispatch(resetNavigationAction)
          }}
        >
          <Body>
            <Text style={{ color: '#e00' }}>Esci da questa identità SPID</Text>
          </Body>
          <Right>
            <Icon style={{ color: '#e99' }} name="log-out" />
          </Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem last>
          <Body>
            <Text style={ProfileStyles.version}>Version {VERSION}</Text>
          </Body>
        </ListItem>
      </Content>
    )
  }
}

module.exports = ProfileComponent

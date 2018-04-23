/**
 * @flow
 */

import * as React from 'react'

import { StyleSheet, Linking } from 'react-native'

import {
  Content,
  ListItem,
  Text,
  Right,
  Icon,
  Body,
  Grid,
  Row,
  Col
} from 'native-base'

import I18n from '../i18n'

import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'
import { type Dispatch } from '../actions/types'
import { type LoggedInUserState } from '../reducers/user'
import { type ProfileState } from '../store/reducers/profile'

import { VERSION } from '../utils/constants'

import { ProfileStyles } from './styles'

import { getIdpInfo } from './SpidLoginButton'

import config from '../config'
import { type ApiProfile } from '../api'

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

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  dispatch: Dispatch,
  user: LoggedInUserState,
  preferences: ProfileState
}

/**
 * Implements the content of the user profile screen.
 */
class ProfileComponent extends React.Component<Props> {
  render(): React.Node {
    const preferencesPot = this.props.preferences
    const profile = this.props.user.profile
    const idpId = this.props.user.idpId
    const idpInfo = getIdpInfo(idpId)

    const isInboxEnabledPot = preferencesPot.map(
      (prefs: ApiProfile): boolean => prefs.is_inbox_enabled
    )

    const name = profile && profile.name ? profile.name : ''
    const familyName =
      profile && profile.family_name ? profile.family_name : '-'
    const fullName = `${name} ${familyName}`
    const fiscalNumber =
      profile && profile.fiscal_code
        ? profile.fiscal_code.replace('TINIT-', '')
        : '-'
    const preferred_email =
      profile && profile.preferred_email ? profile.preferred_email : '-'
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
                  <Text style={profileRowTextStyles}>{preferred_email}</Text>
                </Col>
              </Row>
              <Row>
                <Col style={profileRowStyles}>
                  <Icon name="mobile" style={profileRowIconStyles} />
                  <Text style={profileRowTextStyles}>{mobilePhone}</Text>
                </Col>
              </Row>
              <Row>
                <Text>
                  {isInboxEnabledPot.fold(
                    (): string => 'empty',
                    (value: boolean): string => `${value.toString()}`,
                    (startTime: Date): string =>
                      `Loading since ${startTime.toString()}`,
                    (error: string): string => `Error: ${error}`,
                    (value: boolean, startTime: Date): string =>
                      `(${value.toString()}) Refreshing since ${startTime.toString()}`,
                    (value: boolean, error: string): string =>
                      `(${value.toString()}) Refresh error: ${error}`,
                    (): string => 'Unavailable'
                  )}
                </Text>
              </Row>
            </Grid>
          </Body>
        </ListItem>

        <ListItem itemDivider />

        <ListItem itemHeader first>
          <Text style={preferenceHeaderTextStyles}>
            {I18n.t('profile.sections.spid')}
          </Text>
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
            <Text>{idpInfo ? idpInfo.name : I18n.t('profile.unknown')}</Text>
          </Body>
          <Right>
            <Icon name="chevron-right" style={{ fontSize: 18 }} />
          </Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem
          first
          last
          icon
          onPress={() => {
            this.props.dispatch(logOut())
          }}
        >
          <Body>
            <Text style={{ color: '#e00' }}>{I18n.t('profile.logout')}</Text>
          </Body>
          <Right>
            <Icon style={{ color: '#e99' }} name="log-out" />
          </Right>
        </ListItem>

        <ListItem itemDivider />

        <ListItem last>
          <Body>
            <Text style={ProfileStyles.version}>
              {`${I18n.t('global.app.version')} ${VERSION} (${
                config.environment
              })`}
            </Text>
          </Body>
        </ListItem>
      </Content>
    )
  }
}

module.exports = ProfileComponent

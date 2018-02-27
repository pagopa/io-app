/**
 * @flow
 */

'use strict'

import React, { Component } from 'react'

import { Content, Button, Text, View } from 'native-base'

import type { Dispatch } from '../actions/types'
import type { LoggedInUserState } from '../reducers/user'

import { updateUserProfile } from '../actions'

import I18n from '../i18n'

type Props = {
  dispatch: Dispatch,
  user: LoggedInUserState
}

/**
 * Implements content of the "Alerts" tab
 */
export default class AlertsComponent extends Component<Props> {
  render() {
    const user = this.props.user

    if (!user.profile) {
      return (
        <Content padder>
          <View />
        </Content>
      )
    }

    const profile = user.profile

    return (
      <Content padder>
        {!profile.is_inbox_enabled ? (
          <View>
            <Text>{I18n.t('inbox.enableCallToActionDescription')}</Text>
            <Button
              onPress={() => {
                this.props.dispatch(
                  updateUserProfile({
                    is_inbox_enabled: true,
                    version: profile.version
                  })
                )
              }}
            >
              <Text>{I18n.t('inbox.enableButton')}</Text>
            </Button>
          </View>
        ) : (
          <View>
            <Button
              onPress={() => {
                this.props.dispatch(
                  updateUserProfile({
                    is_inbox_enabled: false,
                    version: profile.version
                  })
                )
              }}
            >
              <Text>{I18n.t('inbox.disableButton')}</Text>
            </Button>
          </View>
        )}
      </Content>
    )
  }
}

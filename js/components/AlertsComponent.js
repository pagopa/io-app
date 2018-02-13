/**
 * @flow
 */

'use strict'

const React = require('React')

import { Content, Button, Text, View } from 'native-base'

import type { Dispatch } from '../actions/types'
import type { UserState } from '../reducers/user'

import { requestUpdateUserProfile } from '../actions'

import I18n from '../i18n'

/**
 * Implements content of the "Alerts" tab
 */
export default class AlertsComponent extends React.Component {
  props: {
    dispatch: Dispatch,
    user: UserState
  }

  render() {
    const user = this.props.user
    const profile = user.profile

    return (
      <Content padder>
        {profile.is_inbox_enabled ? (
          <View>
            <Button
              onPress={() => {
                this.props.dispatch(
                  requestUpdateUserProfile({
                    email: profile.email,
                    is_inbox_enabled: !profile.is_inbox_enabled,
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
            <Text>{I18n.t('inbox.enableCallToActionDescription')}</Text>
            <Button
              onPress={() => {
                this.props.dispatch(
                  requestUpdateUserProfile({
                    email: profile.email,
                    is_inbox_enabled: !profile.is_inbox_enabled,
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

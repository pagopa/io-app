import * as React from 'react'

import { Content, Button, Text, View } from 'native-base'

import { Dispatch } from '../actions/types'
import { LoggedInUserState } from '../reducers/user'

import { updateUserProfile } from '../actions'
import { updateProfile } from '../store/actions/profile'

import I18n from '../i18n'

export type Props = {
  user: LoggedInUserState,
  dispatch: Dispatch
}

/**
 * A component to show the Messages of the logged user.
 * If the user inbox is still not enabled a CTA button is rendered to enable it.
 */
export default class MessagesComponent extends React.Component<Props> {
  render(): React.ReactNode {
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
                // TODO: Saga test: remove this before merging into master
                this.props.dispatch(
                  updateProfile({
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

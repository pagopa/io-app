/**
 * Implements the component for receive the update
 * notification via email.
 *
 * @providesModule SpidUpdateNotification
 * @flow
 */

'use strict'

const React = require('React')

import { StyleSheet } from 'react-native'

import { Text, View, Item, Input } from 'native-base'

import EmailValidator from 'email-validator'

import { SpidUpdateNotificationStyle } from './styles'

import I18n from '../i18n'

/**
 * Implements the component that allows to insert a mail for update notification about SPID.
 */
export default class SpidUpdateNotification extends React.Component {
  state: {
    isEmailValid: boolean
  }

  constructor(props) {
    super(props)
    this.state = {
      isEmailValid: false
    }
  }

  _onEmailChange = text => {
    this.setState({
      isEmailValid: EmailValidator.validate(text)
    })
  }

  render() {
    return (
      <View>
        <Text style={StyleSheet.flatten(SpidUpdateNotificationStyle.text)}>
          {I18n.t('spidUpdateNotification.line1')}
        </Text>
        <Item fixedLabel>
          <Input
            style={StyleSheet.flatten(SpidUpdateNotificationStyle.bottom)}
            placeholder={I18n.t('spidUpdateNotification.line2')}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={I18n.t('spidUpdateNotification.keyboardType')}
            returnKeyLabel={I18n.t('spidUpdateNotification.returnKeyLabel')}
            onChangeText={() => this._onEmailChange.bind(this)}
          />
        </Item>
      </View>
    )
  }
}

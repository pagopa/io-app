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

import { CommonStyles } from './styles'

import I18n from '../i18n'

const styles = StyleSheet.create({
  text: {
    marginTop: 20
  },
  button: {
    borderBottomWidth: 1
  }
})

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
        <Text style={[styles.text, StyleSheet.flatten(CommonStyles.textFont)]}>
          {I18n.t('spidUpdateNotification.line1')}
        </Text>
        <Item fixedLabel>
          <Input
            style={styles.button}
            placeholderTextColor="#4A5B6F"
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

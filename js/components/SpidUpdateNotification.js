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

import { Button, Text, View, Item, Input } from 'native-base'

import EmailValidator from 'email-validator'

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

  _onEmailChange(text: string) {
    this.setState({
      isEmailValid: EmailValidator.validate(text)
    })
  }

  render() {
    return (
      <View>
        <Text
          style={{
            fontSize: 16,
            marginTop: 20,
            color: '#4A5B6F'
          }}
        >
          Se ti va, lasciaci il tuo indirizzo email per ricevere promemoria e
          aggiornamenti su questa app
        </Text>
        <Item fixedLabel>
          <Input
            style={{ borderBottomWidth: 1 }}
            placeholderTextColor="#4A5B6F"
            placeholder="   indirizzo email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyLabel="send"
            onChangeText={this._onEmailChange.bind(this)}
          />
        </Item>
      </View>
    )
  }
}

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

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    marginTop: 20,
    color: '#4A5B6F'
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
        <Text style={styles.text}>
          Se ti va, lasciaci il tuo indirizzo email per ricevere promemoria e
          aggiornamenti su questa app
        </Text>
        <Item fixedLabel>
          <Input
            style={styles.button}
            placeholderTextColor="#4A5B6F"
            placeholder="   indirizzo email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyLabel="send"
            onChangeText={() => this._onEmailChange.bind(this)}
          />
        </Item>
      </View>
    )
  }
}

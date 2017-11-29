/**
 * Implements the component for helping the user
 * to subscribe to SPID.
 *
 * @providesModule SpidSubscribeComponent
 * @flow
 */

'use strict'

const React = require('React')

import { StyleSheet, Image } from 'react-native'

import {
  Button,
  Text,
  H1,
  H2,
  Grid,
  Row,
  Col,
  Icon,
  View,
  Item,
  Input
} from 'native-base'

import EmailValidator from 'email-validator'

export default class SpidSubscribeComponent extends React.Component {
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
        <Text style={{ fontSize: 16, color: '#d4e4fb', marginTop: 5 }}>
          SPID è l'identità digitale per accedere ai servizi online della
          Pubblica Amministrazione Italiana.
        </Text>
        <Text style={{ fontSize: 16, color: '#fff', marginTop: 10 }}>
          Inserisci la tua e-mail per attivarla.
        </Text>
        <Item fixedLabel>
          <Input
            style={{ color: '#fff' }}
            placeholderTextColor="#7eb4eb"
            placeholder="io@email.it"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyLabel="send"
            onChangeText={this._onEmailChange.bind(this)}
          />
          <Icon
            style={{ color: this.state.isEmailValid ? '#fff' : '#7eb4eb' }}
            name="check"
          />
        </Item>
      </View>
    )
  }
}

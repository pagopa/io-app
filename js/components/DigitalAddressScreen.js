/**
 * Implements the screen for setting the Digital Address.
 *
 * @providesModule DigitalAddressScreen
 * @flow
 *
 * TODO save email address in user state
 * TODO set default email address to the one from user state
 * TODO handle address ownership validation flow
 */

'use strict'

const React = require('React')

import //	StyleSheet,
'react-native'

import {
  Container,
  Content,
  Header,
  Text,
  Left,
  Right,
  Icon,
  Button,
  Item,
  Input
} from 'native-base'

import EmailValidator from 'email-validator'

import type { NavigationScreenProp } from 'react-navigation/src/TypeDefinition'
import type { Dispatch, AnyAction } from '../actions/types'
import type { LoggedInUserState } from '../reducers/user'

// import { ProfileStyles } from './styles'

const DEFAULT_EMAIL_PLACEHOLDER = 'io@pec.mail.it'

class DigitalAddressScreen extends React.Component {
  props: {
    navigation: NavigationScreenProp<*, AnyAction>,
    dispatch: Dispatch,
    user: LoggedInUserState
  }

  state: {
    email: string,
    isEmailValid: boolean
  }

  constructor(props: any) {
    super(props)
    this.state = {
      email: 'pinco@pec.italia.it',
      isEmailValid: false
    }
  }

  _onEmailChange(text: string) {
    this.setState({
      email: text,
      isEmailValid: EmailValidator.validate(text)
    })
  }

  render() {
    return (
      <Container style={{ backgroundColor: '#fff' }}>
        <Header style={{ alignItems: 'center' }}>
          <Left>
            <Button
              transparent
              onPress={() => {
                this.props.navigation.goBack()
              }}
            >
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Text style={{ color: '#fff', fontSize: 20 }}>
            DOMICILIO DIGITALE
          </Text>
          <Right>
            <Button transparent onPress={() => {}}>
              <Icon
                style={{ color: this.state.isEmailValid ? '#fff' : '#7eb4eb' }}
                name="check"
              />
            </Button>
          </Right>
        </Header>
        <Content style={{ padding: 10 }}>
          <Item fixedLabel style={{ marginTop: 10 }}>
            <Input
              placeholder={DEFAULT_EMAIL_PLACEHOLDER}
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyLabel="send"
              onChangeText={this._onEmailChange.bind(this)}
            />
          </Item>
          <Text style={{ marginTop: 20 }}>
            Se possiedi un indirizzo di Posta Elettronica Certificata (PEC)
            personale, puoi usarlo per ricevere le comunicazioni ufficiali dalle
            pubblica amministrazioni abilitate.
          </Text>
          <Text style={{ marginTop: 10 }}>
            Non ti preoccupare! Dopo aver impostato il Domicilio Digitale, se lo
            vorrai potrai comunque continuare a ricevere le comunicazioni per
            via cartacea.
          </Text>
        </Content>
      </Container>
    )
  }
}

module.exports = DigitalAddressScreen

/**
* Schermata demo di selezione dell'Identiry Provider SPID
 *
 * @providesModule LoginDemoComponent
 * @flow
 */

import React, { Component } from 'react';

import { View, StyleSheet, Image } from 'react-native'

import { Container, Header, Content, Form, Item, Input, Label} from 'native-base';
import { Button, Text, Icon } from 'native-base';
import { H1, H2 } from 'native-base';

const styles = StyleSheet.create({
  buttonsContainer: {
    padding: 15,
  },
  buttons: {
    marginTop: 15,
  },
})

export default class LoginDemoComponent extends Component {

  props: {
    onProceedSpidLoginDemo: () => void,
    onCancelSpidLoginDemo: () => void,
  }

  render() {
    return (
      <Container>
        
        <View style={{ padding: 15 }}>
          <H2>Richiesta di accesso da</H2>
          <H1 style={{ paddingTop: 15 }}>AgID</H1>
        </View>

        <Content>
          <Form>
            <Item stackedLabel>
              <Label>NOME UTENTE</Label>
              <Input placeholder="inserisci e-mail" disabled value="demo@gestorespid.it" />
            </Item>
            <Item stackedLabel last>
              <Label>Password</Label>
              <Input placeholder="inserisci password" disabled value="********" />
            </Item>
          </Form>
        </Content>

        <Content style={styles.buttonsContainer}>
          <Button block rounded bordered onPress={() => {
            this.props.onCancelSpidLoginDemo()
          }}>
            <Text>ANNULLA</Text>
          </Button>
          <Button iconLeft block rounded style={styles.buttons} onPress={() => {
            this.props.onProceedSpidLoginDemo()
          }}>
            <Icon name="user" />
            <Text>ENTRA CON SPID</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}
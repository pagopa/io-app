/**
 * Implements content of the "Alerts" tab
 *
 * @providesModule AlertsComponent
 * @flow
 */

'use strict'

import { getIdpInfo } from './SpidLoginButton'

const React = require('React')

import { Content, Button, Body, Text, Card, CardItem, View } from 'native-base'

import type { Dispatch } from '../actions/types'
import type { UserState } from '../reducers/user'

import { requestUpdateUserProfile } from '../actions'

class MessageBoxComponent extends React.Component {
  render() {
    return (
      <View>
        <Card>
          <CardItem header>
            <Text>Comune di Milano</Text>
          </CardItem>
          <CardItem>
            <Body>
              <Text>La tua carta di identità sta per scadere.</Text>
            </Body>
          </CardItem>
          <CardItem footer>
            <Button light small>
              <Text>Richiedi il rinnovo</Text>
            </Button>
          </CardItem>
        </Card>

        <Card>
          <CardItem header>
            <Text>Agenzie delle Entrate</Text>
          </CardItem>
          <CardItem>
            <Body>
              <Text>La tua posizione pensionistica è stata aggiornata.</Text>
            </Body>
          </CardItem>
          <CardItem footer>
            <Button light small>
              <Text>Visualizza</Text>
            </Button>
          </CardItem>
        </Card>
        <Card>
          <CardItem header>
            <Text>Ministero dell'Istruzione</Text>
          </CardItem>
          <CardItem>
            <Body>
              <Text>Sono aperte le iscrizioni per la scuola elementare.</Text>
            </Body>
          </CardItem>
          <CardItem footer>
            <Button light small>
              <Text>Vai alla pagina di iscrizione</Text>
            </Button>
          </CardItem>
        </Card>
      </View>
    )
  }
}

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
              <Text>Disabilita Inbox</Text>
            </Button>
            <MessageBoxComponent />
          </View>
        ) : (
          <View>
            <Text>Abilita l'inbox per visualizzare i messaggi</Text>
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
              <Text>Abilita Inbox</Text>
            </Button>
          </View>
        )}
      </Content>
    )
  }
}

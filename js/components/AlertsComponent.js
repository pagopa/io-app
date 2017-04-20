/**
 * @providesModule AlertsComponent
 * @flow
 */

'use strict'

const React = require('React')
import {
  Content,
  Button,
  Body,
	Text,
	Card,
  CardItem,
} from 'native-base'
import type { Action } from '../actions/types'
import type { UserState } from '../reducers/user'

// const {
// } = require('../actions');

class AlertsComponent extends React.Component {

  props: {
    dispatch: (action: Action) => void;
    user: UserState;
  };

  render() {
    return(
      <Content padder>
        <Card>
          <CardItem header>
              <Text>Comune di Milano</Text>
          </CardItem>
          <CardItem>
              <Body>
                  <Text>
                      La tua carta di identità sta per scadere.
                  </Text>
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
                  <Text>
                    La tua posizione pensionistica è stata aggiornata.
                  </Text>
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
              <Text>
                Sono aperte le iscrizioni per la scuola elementare.
              </Text>
            </Body>
          </CardItem>
          <CardItem footer>
            <Button light small>
              <Text>Vai alla pagina di iscrizione</Text>
            </Button>
          </CardItem>
        </Card>

      </Content>
    )
  }
}

module.exports = AlertsComponent

/**
 * Implements the content of the "Calendar" tab
 *
 * @providesModule CalendarComponent
 * @flow
 */

'use strict'

const React = require('React')

import {
  Content,
  Text,
  Separator,
  ListItem,
  List,
  Grid,
  Row,
  Col
} from 'native-base'

import type { Dispatch } from '../actions/types'
import type { UserState } from '../reducers/user'

class CalendarItemComponent extends React.Component {
  props: {
    last?: boolean,
    date: string,
    title: string,
    amount: string
  }

  render() {
    return (
      <ListItem last={this.props.last}>
        <Grid>
          <Col>
            <Row>
              <Text style={{ fontSize: 14, marginBottom: 5 }}>
                {this.props.date}
              </Text>
            </Row>
            <Row>
              <Col size={10}>
                <Row>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {this.props.title}
                  </Text>
                </Row>
              </Col>
              <Col size={5}>
                <Row style={{ justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {this.props.amount}
                  </Text>
                </Row>
              </Col>
            </Row>
          </Col>
        </Grid>
      </ListItem>
    )
  }
}

export default class CalendarComponent extends React.Component {
  props: {
    dispatch: Dispatch,
    user: UserState
  }

  render() {
    return (
      <Content>
        <List>
          <Separator bordered style={{ backgroundColor: '#0066cc' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              PROSSIMI 7 GIORNI
            </Text>
          </Separator>
          <CalendarItemComponent
            date="4 Maggio"
            title="Bollo auto"
            amount="€ 127,00"
          />
          <CalendarItemComponent
            date="6 Maggio"
            title="TARI"
            amount="€ 86,20"
          />
          <CalendarItemComponent
            last
            date="7 Maggio"
            title="Iscrizione a scuola"
            amount="€ 15,10"
          />
          <Separator bordered style={{ backgroundColor: '#1f8fff' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              PROSSIMO MESE
            </Text>
          </Separator>
          <CalendarItemComponent
            last
            date="1 Giugno"
            title="IMU"
            amount="€ 217,40"
          />
          <Separator bordered>
            <Text>PIÙ AVANTI</Text>
          </Separator>
          <CalendarItemComponent
            last
            date="1 Settembre"
            title="Iscrizione a scuola"
            amount=""
          />
        </List>
      </Content>
    )
  }
}

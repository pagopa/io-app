/**
 * @providesModule CalendarComponent
 * @flow
 */

'use strict'

const React = require('React')
import { StyleSheet } from 'react-native'
import {
  Content,
  Button,
  Body,
	Text,
	Card,
  CardItem,
  Separator,
  ListItem,
  H1,
  List,
  Left,
  Right,
  Icon,
  Grid,
  Row,
  Col,
} from 'native-base'
import type { Action } from '../actions/types'
import type { UserState } from '../reducers/user'

// const {
// } = require('../actions');

class CalendarItemComponent extends React.Component {

  props: {
    last?: boolean,
    date: string,
    title: string,
    amount: string,
  }

  render() {
    return (
      <ListItem last={this.props.last}>
        <Grid>
          <Col>
            <Row>
              <Text style={{fontSize: 14, marginBottom: 5}}>{this.props.date}</Text>
            </Row>
            <Row>
              <Col size={10}>
                <Row><Text style={{fontSize: 20, fontWeight: 'bold'}}>{this.props.title}</Text></Row>
              </Col>
              <Col size={5}>
                <Row style={{justifyContent: 'flex-end'}}><Text style={{fontSize: 20, fontWeight: 'bold'}}>{this.props.amount}</Text></Row>
              </Col>
            </Row>
          </Col>
        </Grid>
      </ListItem>
    )
  }

}

class CalendarComponent extends React.Component {

  props: {
    dispatch: (action: Action) => void,
    user: UserState
  };

  render() {
    return(
      <Content>
        <List>
          <Separator bordered style={{backgroundColor: '#0066cc'}}>
              <Text style={{color:'#fff', fontWeight: 'bold'}}>PROSSIMI 7 GIORNI</Text>
          </Separator>
          <CalendarItemComponent date='4 Maggio' title='Bollo auto' amount='€ 127,00' />
          <CalendarItemComponent date='6 Maggio' title='TARI' amount='€ 86,20' />
          <CalendarItemComponent last date='7 Maggio' title='Iscrizione a scuola' amount='€ 15,10' />
          <Separator bordered style={{backgroundColor: '#1f8fff'}}>
            <Text style={{color:'#fff', fontWeight: 'bold'}}>PROSSIMO MESE</Text>
          </Separator>
          <CalendarItemComponent last date='1 Giugno' title='IMU' amount='€ 217,40' />
          <Separator bordered>
              <Text>PIÙ AVANTI</Text>
          </Separator>
          <CalendarItemComponent last date='1 Settembre' title='Iscrizione a scuola' amount='' />

        </List>
      </Content>
    )
  }
}

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51
const styles = StyleSheet.create({
  itemIcon: {
    fontSize: 15,
  },
})

module.exports = CalendarComponent

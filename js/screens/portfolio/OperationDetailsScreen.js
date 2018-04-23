/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'

import { PortfolioStyles } from '../../components/styles'
import {
  Button,
  Grid,
  H2,
  Left,
  Right,
  Row,
  Text,
  Content
} from 'native-base'
import type { Operation, CreditCard } from '../../lib/portfolio/types'
import type { NavigationScreenProp, NavigationState } from 'react-navigation'
import { UNKNOWN_OPERATION } from '../../lib/portfolio/unknowns'

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  operation: Operation,
  parent: string,
  card: CreditCard
};

/**
 * Details of transaction
 */
class OperationDetailsScreen extends React.Component<Props>
{
  static navigationOptions = {
    title: 'Operations Details'
  }

  constructor(props: Props)
  {
    super(props)
  }

  render(): React.Node
  {
    const { navigate } = this.props.navigation;
    const TITLE: string = 'Dettagli dell\'operazione';
    const { params } = this.props.navigation.state;
    const operation: Operation = params ? params.operation : UNKNOWN_OPERATION;
    return (
      <Content>
        <H2 style={PortfolioStyles.titleStyle}>{TITLE}</H2>
        <Grid style={{ marginTop: 50 }}>
          <Row>
            <Left><Text>{'Totale ' + operation.currency}</Text></Left>
            <Right><Text style={PortfolioStyles.boldStyle}>{operation.amount}</Text></Right>
          </Row>
          <Row>
            <Left><Text note>{'Importo da pagare'}</Text></Left>
            <Right><Text>{operation.amount}</Text></Right>
          </Row>
          <Row>
            <Left><Text note>{'Costo transazione'}</Text>
              <Button transparent>{'Perché?'}</Button></Left>
            <Right><Text>{operation.transactionCost}</Text></Right>
          </Row>
          <Row>
            <Left><Text note>{'Causale'}</Text></Left>
            <Right><Text style={PortfolioStyles.boldStyle}>{operation.subject}</Text></Right>
          </Row>
          <Row>
            <Left><Text note>{'Destinatario'}</Text></Left>
            <Right><Text style={PortfolioStyles.boldStyle}>{operation.recipient}</Text></Right>
          </Row>
          <Row>
            <Left><Text note>{'Data'}</Text></Left>
            <Right><Text>{operation.date}</Text></Right>
          </Row>
          <Row>
            <Left><Text note>{'Ora'}</Text></Left>
            <Right><Text>{operation.time}</Text></Right>
          </Row>
          <Row>
            <Button style={{ marginTop: 40 }} block success title="Receipt" onPress={(): boolean => navigate('Login')}>
              <Text>{'Vedi la ricevuta'}</Text>
            </Button>
          </Row>
        </Grid>
      </Content>
    )
  }
}

export default OperationDetailsScreen

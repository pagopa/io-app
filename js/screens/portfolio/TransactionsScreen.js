/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'

import I18n from '../../i18n'
import {
  Container,
  Content,
  Grid,
  H2,
  Left,
  Right,
  Row,
  Text } from 'native-base'
import { PortfolioStyles } from '../../components/styles'
import { UNKNOWN_CARD } from '../../lib/portfolio/unknowns'
import PortfolioAPI from '../../lib/portfolio/portfolio-api'
import OperationsList from '../../components/portfolio/OperationsComponent'

import type { Operation, CreditCard } from '../../lib/portfolio/types'
import type { NavigationScreenProp, NavigationState } from 'react-navigation'

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  card: CreditCard
};


/**
 * Show credit card transactions
 */
class TransactionsScreen extends React.Component<Props>
{
  static navigationOptions = {
      title: I18n.t('portfolio.transactions'),
      headerBackTitle: null
  }

  constructor(props: Props)
  {
    super(props)
  }

  render(): React.Node
  {
    // $FlowFixMe
    const { params } = this.props.navigation.state;
    //      ^^^^^^ https://github.com/react-navigation/react-navigation/issues/1237
    const card: CreditCard = params ? params.card : UNKNOWN_CARD;
    const operations: $ReadOnlyArray<Operation> = PortfolioAPI.getOperations(card.id);
    const TITLE: string = I18n.t('portfolio.transactions');

    return (
      <Container>
        <Content>
          <Grid>
            <Row>
              <Text note>{card.brand +' - '+ card.number}</Text>
            </Row>
            <Row style={{marginTop: 5}}>
              <Left>
                <H2 style={PortfolioStyles.titleStyle}>{TITLE}</H2>
              </Left>
              <Right>
                <Text note>{I18n.t('portfolio.total')}</Text>
              </Right>
            </Row>
            <Row style={{marginTop: 10}}>
                <OperationsList
                  parent={I18n.t('portfolio.transactions')}
                  operations={operations}
                  navigation={this.props.navigation}/>
            </Row>
          </Grid>
        </Content>
      </Container>
    )
  }
}

export default TransactionsScreen

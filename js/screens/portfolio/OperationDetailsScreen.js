/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'

import I18n from '../../i18n'
import { PortfolioStyles } from '../../components/styles'
import {
  Text,
  Left,
  Right,
  Button,
  View,
  Content
} from 'native-base'
import { Grid, Row } from 'react-native-easy-grid'
import type { Operation, CreditCard } from '../../lib/portfolio/types'
import type { NavigationScreenProp, NavigationState } from 'react-navigation'
import { UNKNOWN_OPERATION } from '../../lib/portfolio/unknowns'
import SimpleLayout from '../../components/portfolio/SimpleLayout'
import ROUTES from '../../navigation/routes'
import { Image, TouchableHighlight } from 'react-native'

// Images
import cardsImage from '../../../img/portfolio/single-tab.png'

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  operation: Operation,
  parent: string,
  card: CreditCard
}

/**
 * Details of transaction
 */
class OperationDetailsScreen extends React.Component<Props> {
  static navigationOptions = {
    title: I18n.t('portfolio.operationsDetails'),
    headerBackTitle: null
  }

  constructor(props: Props) {
    super(props)
  }

  touchableContent(): React.Node {
    const { navigate } = this.props.navigation
    return (
      <View style={PortfolioStyles.container}>
        <TouchableHighlight
          onPress={(): boolean => navigate(ROUTES.PORTFOLIO_OPERATION_DETAILS)}
        >
          <Image style={PortfolioStyles.pfsingle} source={cardsImage} />
        </TouchableHighlight>
      </View>
    )
  }

  render(): React.Node {
    const { navigate } = this.props.navigation
    const TITLE: string = I18n.t('portfolio.operationsDetails')
    // $FlowFixMe
    const { params } = this.props.navigation.state
    const operation: Operation = params ? params.operation : UNKNOWN_OPERATION
    return (
      <SimpleLayout title={TITLE} touchableContent={this.touchableContent()}>
        <Content style={PortfolioStyles.pfwhite}>
          <Grid>
            <Row>
              <Left>
                <Text>
                  {I18n.t('portfolio.total') + ' ' + operation.currency}
                </Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.amount}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.payAmount')}</Text>
              </Left>
              <Right>
                <Text>{operation.amount}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text>
                  <Text note>{I18n.t('portfolio.transactionFee')}</Text>
                  <Text note>&nbsp;</Text>
                  <Text note style={PortfolioStyles.pfwhy}>{I18n.t('portfolio.why')}</Text>
                </Text>
              </Left>
              <Right>
                <Text>{operation.transactionCost}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.causal')}</Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.subject}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.recipient')}</Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.recipient}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.date')}</Text>
              </Left>
              <Right>
                <Text>{operation.date}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.hour')}</Text>
              </Left>
              <Right>
                <Text>{operation.time}</Text>
              </Right>
            </Row>
            <Row>
              <Button
                style={{ marginTop: 20 }}
                block
                success
                title={I18n.t('portfolio.receipt')}
                onPress={(): boolean => navigate('Login')}
              >
                <Text>{I18n.t('portfolio.seeReceipt')}</Text>
              </Button>
            </Row>
          </Grid>
        </Content>
      </SimpleLayout>
    )
  }
}

export default OperationDetailsScreen

/*

 <Container>
        <Content>
          <H2 style={PortfolioStyles.titleStyle}>{TITLE}</H2>
          <Grid style={{ marginTop: 50 }}>
            <Row>
              <Left>
                <Text>
                  {I18n.t('portfolio.total') + ' ' + operation.currency}
                </Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.amount}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.payAmount')}</Text>
              </Left>
              <Right>
                <Text>{operation.amount}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.transactionFee')}</Text>
                <Button transparent>{I18n.t('portfolio.why')}</Button>
              </Left>
              <Right>
                <Text>{operation.transactionCost}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.causal')}</Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.subject}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.recipient')}</Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.recipient}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.date')}</Text>
              </Left>
              <Right>
                <Text>{operation.date}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t('portfolio.hour')}</Text>
              </Left>
              <Right>
                <Text>{operation.time}</Text>
              </Right>
            </Row>
            <Row>
              <Button
                style={{ marginTop: 40 }}
                block
                success
                title={I18n.t('portfolio.receipt')}
                onPress={(): boolean => navigate('Login')}
              >
                <Text>{I18n.t('portfolio.seeReceipt')}</Text>
              </Button>
            </Row>
          </Grid>
        </Content>
      </Container>

 */

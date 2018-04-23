/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'
import I18n from '../../i18n'
import type { NavigationScreenProp, NavigationState } from 'react-navigation'
import { Image, TouchableHighlight } from 'react-native'
import {
  Container,
  Content,
  H2,
  Row,
  Text,
  View,
  Left,
  Right } from 'native-base'
import { Grid } from 'react-native-easy-grid'
import { PortfolioStyles } from '../../components/styles'
import OperationsList from '../../components/portfolio/OperationsComponent'
import PortfolioAPI from '../../lib/portfolio/portfolio-api'

import type { Operation } from '../../lib/portfolio/types'
import ROUTES from '../../navigation/routes'

type Props = {
  navigation: NavigationScreenProp<NavigationState>
};

/**
 * Portfolio Home Screen
 */
class PortfolioHomeScreen extends React.Component<Props>
{
  static navigationOptions = {
    title: I18n.t('portfolio.portfolio')
  }

  constructor(props: Props)
  {
    super(props)
  }

  render(): React.Node
  {
    const { navigate } = this.props.navigation;
    const TITLE = I18n.t('portfolio.portfolio');
    const cardsImage = require('../../../img/creditcards.jpg');
    const latestOperations: ReadonlyArray<Operation> = PortfolioAPI.getLatestOperations();

    return (

      <Container>
        <Content>
          <Grid style={{ marginTop: 100 }}>
            <Row>
              <H2 style={PortfolioStyles.titleStyle}>{TITLE}</H2>
            </Row>
            <Row style={{ marginTop: 5 }}>
              <Left>
                <Text style={PortfolioStyles.titleStyle}>{I18n.t('portfolio.paymentMethods')}</Text>
              </Left>
              <Right>
                <Text>{I18n.t('portfolio.add')}</Text>
              </Right>
            </Row>
            <Row style={{ marginTop: 20 }}>
              <View style={PortfolioStyles.container}>
                <TouchableHighlight onPress={(): boolean => navigate(ROUTES.PORTFOLIO_CREDITCARDS)}>
                  <Image style={PortfolioStyles.image}
                         source={cardsImage}/>
                </TouchableHighlight>
              </View>
            </Row>
            <Row>
              <OperationsList parent={I18n.t('portfolio.portfolio')} operations={latestOperations}/>
            </Row>
          </Grid>
        </Content>
      </Container>

    )
  }
}

export default PortfolioHomeScreen

/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'

import I18n from '../../i18n'
import { Content, View } from 'native-base'
import { PortfolioStyles } from '../../components/styles'
import { UNKNOWN_CARD } from '../../lib/portfolio/unknowns'
import PortfolioAPI from '../../lib/portfolio/portfolio-api'
import OperationsList from '../../components/portfolio/OperationsComponent'
import ROUTES from '../../navigation/routes'
import { Image, TouchableHighlight } from 'react-native'
import SimpleLayout from '../../components/portfolio/SimpleLayout'

import type { Operation, CreditCard } from '../../lib/portfolio/types'
import type { NavigationScreenProp, NavigationState } from 'react-navigation'

// Images
import cardsImage from '../../../img/portfolio/card-tab.png'

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  card: CreditCard
}

/**
 * Show credit card transactions
 */
class TransactionsScreen extends React.Component<Props> {
  static navigationOptions = {
    title: I18n.t('portfolio.transactions'),
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
          <Image style={PortfolioStyles.pftabcard} source={cardsImage} />
        </TouchableHighlight>
      </View>
    )
  }

  render(): React.Node {
    // $FlowFixMe
    const { params } = this.props.navigation.state
    const card: CreditCard = params ? params.card : UNKNOWN_CARD
    const operations: $ReadOnlyArray<Operation> = PortfolioAPI.getOperations(
      card.id
    )
    const TITLE = I18n.t('portfolio.creditDebtCards')

    return (
      <SimpleLayout title={TITLE} touchableContent={this.touchableContent()}>
        <Content style={PortfolioStyles.pfwhite}>
          <OperationsList
            parent={I18n.t('portfolio.transactions')}
            title={I18n.t('portfolio.operations')}
            totalAmount={I18n.t('portfolio.total')}
            operations={operations}
            navigation={this.props.navigation}
          />
        </Content>
      </SimpleLayout>
    )
  }
}

export default TransactionsScreen

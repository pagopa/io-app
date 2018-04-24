/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'
import ROUTES from '../../navigation/routes'
import I18n from '../../i18n'
import type { NavigationScreenProp, NavigationState } from 'react-navigation'
import { Image, TouchableHighlight } from 'react-native'
import { Content, View } from 'native-base'
import { PortfolioStyles } from '../../components/styles'
import OperationsList from '../../components/portfolio/OperationsComponent'
import PortfolioAPI from '../../lib/portfolio/portfolio-api'
import type { Operation } from '../../lib/portfolio/types'
import PayLayout from '../../components/portfolio/PayLayout'

// Images
import cardsImage from '../../../img/portfolio/creditcards.jpg'

type Props = {
  navigation: NavigationScreenProp<NavigationState>
}

/**
 * Portfolio Home Screen
 */
class PortfolioHomeScreen extends React.Component<Props> {
  static navigationOptions = {
    title: I18n.t('portfolio.portfolio'),
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
          onPress={(): boolean =>
            navigate(ROUTES.PORTFOLIO_CREDITCARDS)
          }
        >
          <Image style={PortfolioStyles.pfcards} source={cardsImage} />
        </TouchableHighlight>
      </View>
    )
  }

  render(): React.Node {
    const TITLE = I18n.t('portfolio.portfolio')
    const latestOperations: $ReadOnlyArray<
      Operation
    > = PortfolioAPI.getLatestOperations()
    return (
      <PayLayout
        title={TITLE}
        subtitleLeft={I18n.t('portfolio.paymentMethods')}
        subtitleRight={I18n.t('portfolio.add')}
        touchableContent={this.touchableContent()}
      >
        <Content style={PortfolioStyles.pfwhite}>
          <OperationsList
            parent={I18n.t('portfolio.portfolio')}
            title={I18n.t('portfolio.lastOperations')}
            totalAmount={I18n.t('portfolio.total')}
            operations={latestOperations}
            navigation={this.props.navigation}
          />
        </Content>
      </PayLayout>
    )
  }
}

export default PortfolioHomeScreen

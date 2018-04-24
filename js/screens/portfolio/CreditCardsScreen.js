/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'

import { Image } from 'react-native'
import {
  Body,
  Button,
  Card,
  CardItem,
  Content,
  Icon,
  Left,
  List,
  Text,
  Thumbnail,
  View
} from 'native-base'
import { PortfolioStyles } from '../../components/styles'
import PortfolioAPI from '../../lib/portfolio/portfolio-api'
import ROUTES from '../../navigation/routes'
import I18n from '../../i18n'
import PayLayout from '../../components/portfolio/PayLayout'

import type { NavigationScreenProp, NavigationState } from 'react-navigation'

type Props = {
  navigation: NavigationScreenProp<NavigationState>
}

const cards = PortfolioAPI.getCreditCards()

/**
 * Select Credit Card
 */
class CreditCardsScreen extends React.Component<Props> {
  static navigationOptions = {
    title: I18n.t('portfolio.creditcards'),
    headerBackTitle: null
  }

  constructor(props: Props) {
    super(props)
  }

  render(): React.Node {
    const { navigate } = this.props.navigation
    return (
      <PayLayout
        title={I18n.t('portfolio.creditcards')}
        subtitleLeft={I18n.t('portfolio.paymentMethods')}
      >
        <Content style={PortfolioStyles.pfback}>
          <View style={{ minHeight: 400 }}>
            <List
              removeClippedSubviews={false}
              dataArray={cards}
              renderRow={(item): React.Element<*> => (
                <Card style={{ elevation: 3, marginTop: 5 }}>
                  <CardItem>
                    <Left>
                      <Thumbnail source={item.image} />
                      <Body>
                        <Text>{item.brand}</Text>
                        <Text note>{item.number}</Text>
                      </Body>
                    </Left>
                  </CardItem>
                  <CardItem cardBody>
                    <Image
                      style={{ height: 200, flex: 1 }}
                      source={item.image}
                    />
                  </CardItem>
                  <CardItem>
                    <Icon name="arrow-right" style={{ color: '#0066CC' }} />
                    <Button
                      transparent
                      title="Transactions"
                      onPress={(): boolean =>
                        navigate(ROUTES.PORTFOLIO_CARDS_OPERATIONS, {
                          card: item
                        })
                      }
                    >
                      <Text>{item.lastUsage}</Text>
                    </Button>
                  </CardItem>
                </Card>
              )}
            />
          </View>
        </Content>
      </PayLayout>
    )
  }
}

export default CreditCardsScreen

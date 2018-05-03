import * as React from "react"

import I18n from "../../i18n"
import ROUTES from "../../navigation/routes"
import { Image } from "react-native"
import { Body, Button, Card, CardItem, Content, Icon, Left, List, Text, Thumbnail, View } from "native-base"
import { PortfolioStyles } from "../../components/styles"
import { PortfolioAPI } from "../../api/portfolio/portfolio-api"
import { PayLayout } from "../../components/portfolio/PayLayout"

import { NavigationScreenProp, NavigationState } from "react-navigation"
import CreditCardComponent from '../../components/portfolio/CreditCardComponent';

type Props = {
  navigation: NavigationScreenProp<NavigationState>
}

const cards = PortfolioAPI.getCreditCards()

/**
 * Select Credit Card
 */
export class CreditCardsScreen extends React.Component<Props, never> {

  private static navigationOptions = {
    title: I18n.t("portfolio.creditcards"),
    headerBackTitle: null
  }

  constructor(props: Props) {
    super(props)
  }

  public render(): React.ReactNode {
    const { navigate } = this.props.navigation
    return (
      <PayLayout
        navigation={this.props.navigation}
        title={I18n.t("portfolio.creditcards")}
        subtitleLeft={I18n.t("portfolio.paymentMethods")}
      >
        <Content style={PortfolioStyles.pfback}>
          <View style={{ minHeight: 400 }}>
            <List
              removeClippedSubviews={false}
              dataArray={cards}
              renderRow={(item): React.ReactElement<any> => (
                <CreditCardComponent
                  navigation={this.props.navigation}
                  item={item}
                />
              )}
            />
          </View>
        </Content>
      </PayLayout>
    )
  }
}


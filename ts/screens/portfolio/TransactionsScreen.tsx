import * as React from "react";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

import { Content, View } from "native-base";
import { Image, TouchableHighlight } from "react-native";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { PortfolioAPI } from "../../api/portfolio/portfolio-api";
import { OperationsList } from "../../components/portfolio/OperationsComponent";
import { PayLayout } from "../../components/portfolio/PayLayout";
import { SimpleLayout } from "../../components/portfolio/SimpleLayout";
import { PortfolioStyles } from "../../components/styles";
import { CreditCard, UNKNOWN_CARD } from "../../types/portfolio/CreditCard";
import { Operation } from "../../types/portfolio/types";

// Images
const cardsImage = require("../../../img/portfolio/card-tab.png")

interface ParamType {
  card: CreditCard;
}

interface StateParams extends NavigationState {
  params: ParamType;
}

interface OwnProps {
  navigation: NavigationScreenProp<StateParams>,
  card: CreditCard
}

type Props = OwnProps & NavigationInjectedProps;

/**
 * Show credit card transactions
 */
export class TransactionsScreen extends React.Component<Props, never> {

  public static navigationOptions = {
    title: I18n.t("portfolio.transactions"),
    headerBackTitle: null
  }

  constructor(props: Props) {
    super(props)
  }

  public render(): React.ReactNode {

    const { params } = this.props.navigation.state
    const card: CreditCard = params ? params.card : UNKNOWN_CARD
    const operations: Operation[] = PortfolioAPI.getOperations(
      card.id
    )
    const TITLE = I18n.t("portfolio.creditDebtCards")

    return (
      <PayLayout
        navigation={this.props.navigation}
        title={TITLE}
        touchableContent={this.touchableContent()}
      >
        <Content style={PortfolioStyles.pfwhite}>
          <OperationsList
            parent={I18n.t("portfolio.transactions")}
            title={I18n.t("portfolio.operations")}
            totalAmount={I18n.t("portfolio.total")}
            operations={operations}
            navigation={this.props.navigation}
          />
        </Content>
      </PayLayout>
    )
  }

  private touchableContent(): React.ReactElement<any> {
    const { navigate } = this.props.navigation
    return (
      <View style={PortfolioStyles.container}>
        <Image
          style={PortfolioStyles.pftabcard}
          source={cardsImage}
          resizeMode="contain"
        />
      </View>
    )
  }




}

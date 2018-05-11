import * as React from "react";
import I18n from "../../i18n";

import { Content, View } from "native-base";
import { Image, TouchableHighlight } from 'react-native'
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { PortfolioAPI } from "../../api/portfolio/portfolio-api";
import { OperationsList } from "../../components/portfolio/OperationsComponent";
import { PayLayout } from "../../components/portfolio/pay-layout/PayLayout";
import { PortfolioStyles } from "../../components/styles";
import { CreditCard, UNKNOWN_CARD } from "../../types/portfolio/CreditCard";
import { Operation } from "../../types/portfolio/types";

import { topContentTouchable } from "../../components/portfolio/pay-layout/types";
import ROUTES from '../../navigation/routes'
import { CroppedCard } from '../../components/portfolio/CroppedCard'
// Images
const cardsImage = require("../../../img/portfolio/card-tab.png");

interface ParamType {
  readonly card: CreditCard;
}

interface StateParams extends NavigationState {
  readonly params: ParamType;
}

interface OwnProps {
  readonly navigation: NavigationScreenProp<StateParams>;
  readonly card: CreditCard;
}

type Props = OwnProps & NavigationInjectedProps;

/**
 * Show credit card transactions
 */
export class TransactionsScreen extends React.Component<Props, never> {
  public static navigationOptions = {
    title: I18n.t("portfolio.transactions"),
    headerBackTitle: null
  };

  constructor(props: Props) {
    super(props);
  }

  private getCardImage(card: CreditCard): React.ReactElement<any> {

  }

  private touchableContent(card: CreditCard): React.ReactElement<any> {
    const { navigate } = this.props.navigation;
    return (
      <View style={PortfolioStyles.container}>
        <TouchableHighlight
          onPress={(): boolean => navigate(ROUTES.PORTFOLIO_CREDITCARDS)}
        >
          <CroppedCard card={card} navigation={this.props.navigation}/>
        </TouchableHighlight>
      </View>
    )
  }

  public render(): React.ReactNode {
    const { params } = this.props.navigation.state;
    const card: CreditCard = params ? params.card : UNKNOWN_CARD;
    const operations: ReadonlyArray<Operation> = PortfolioAPI.getOperations(
      card.id
    );
    const TITLE = I18n.t("portfolio.creditDebtCards");

    const topContent = topContentTouchable(this.touchableContent(card));

    return (
      <PayLayout
        navigation={this.props.navigation}
        title={TITLE}
        topContent={topContent}
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
    );
  }
}

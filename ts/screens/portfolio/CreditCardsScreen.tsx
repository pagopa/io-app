import * as React from "react";

import { Content, List, View } from "native-base";
import { PortfolioAPI } from "../../api/portfolio/portfolio-api";
import { PayLayout } from "../../components/portfolio/PayLayout";
import { PortfolioStyles } from "../../components/styles";
import I18n from "../../i18n";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import CreditCardComponent from "../../components/portfolio/CreditCardComponent";
import { CreditCard } from "../../types/portfolio/CreditCard";

type Props = {
  navigation: NavigationScreenProp<NavigationState>;
};

const cards: ReadonlyArray<CreditCard> = PortfolioAPI.getCreditCards();

/**
 * Select Credit Card
 */
export class CreditCardsScreen extends React.Component<Props, never> {
  public static navigationOptions = {
    title: I18n.t("portfolio.creditcards"),
    headerBackTitle: null
  };

  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { navigate } = this.props.navigation;
    return (
      <PayLayout
        navigation={this.props.navigation}
        title={I18n.t("portfolio.creditcards")}
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
    );
  }
}

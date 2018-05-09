import { Button, Content, View } from "native-base";
import * as React from "react";
import { Image, Text, TouchableHighlight } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { PortfolioAPI } from "../../api/portfolio/portfolio-api";
import { OperationsList } from "../../components/portfolio/OperationsComponent";
import { ImageType, PayLayout } from "../../components/portfolio/pay-layout/PayLayout";
import { PortfolioStyles } from "../../components/styles";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Operation } from "../../types/portfolio/types";
import {
  topContentSubtitleTouchable,
  topContentSubtitlesLRTouchable
} from "../../components/portfolio/pay-layout/types";

type ScreenProps = {};

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ScreenProps & OwnProps;

/**
 * Portfolio Home Screen
 */
export class PortfolioHomeScreen extends React.Component<Props, never> {
  public static navigationOptions = {
    title: I18n.t("portfolio.portfolio"),
    headerBackTitle: null
  };

  constructor(props: Props) {
    super(props);
  }

  private touchableContent(): React.ReactElement<any> {

    const str = value.trim();
    if (str.match(/^[\d\s]*$/)) {
      const newStr = str.replace(/\s/,"").match(/\d{4}/);
      if (newStr !== null) {
        console.log(newStr.join(" ")); 
      }
    }
    const { navigate } = this.props.navigation;
    if (PortfolioAPI.getCreditCards().length > 0) {
      return (
        <View style={PortfolioStyles.container}>
          <TouchableHighlight
            onPress={(): boolean => navigate(ROUTES.PORTFOLIO_CREDITCARDS)}
          >
            <Image
              style={PortfolioStyles.pfcards}
              source={require("../../../img/portfolio/creditcards.jpg")}
            />
          </TouchableHighlight>
        </View>
      );
    } else {
      return (
        <View style={PortfolioStyles.container}>
          <Button
            bordered
            block
            style={PortfolioStyles.addPaymentMethodButton}
            onPress={(): boolean =>
              navigate(ROUTES.PORTFOLIO_ADD_PAYMENT_METHOD)
            }
          >
            <Text style={PortfolioStyles.addPaymentMethodText}>
              {I18n.t("portfolio.newPaymentMethod.addButton")}
            </Text>
          </Button>
        </View>
      );
    }
  }

  public render(): React.ReactNode {
    const TITLE = I18n.t("portfolio.portfolio");
    const latestOperations: ReadonlyArray<
      Operation
    > = PortfolioAPI.getLatestOperations();

    const topContents =
      PortfolioAPI.getCreditCards().length > 0
        ? topContentSubtitlesLRTouchable(
            this.touchableContent(),
            I18n.t("portfolio.paymentMethods"),
            I18n.t("portfolio.newPaymentMethod.add")
          )
        : topContentSubtitleTouchable(
            this.touchableContent(),
            I18n.t("portfolio.newPaymentMethod.addDescription")
          );

    return (
      <PayLayout
        navigation={this.props.navigation}
        title={TITLE}
        topContent={topContents}
        rightImage={ImageType.BANK_IMAGE}
      >
        <Content style={PortfolioStyles.pfwhite}>
          <OperationsList
            parent={I18n.t("portfolio.portfolio")}
            title={I18n.t("portfolio.lastOperations")}
            totalAmount={I18n.t("portfolio.total")}
            operations={latestOperations}
            navigation={this.props.navigation}
          />
        </Content>
      </PayLayout>
    );
  }
}

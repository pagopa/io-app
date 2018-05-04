import { Button, Content, View } from "native-base"
import * as React from "react"
import { Image, Text, TouchableHighlight } from "react-native"
import { NavigationScreenProp, NavigationState } from "react-navigation"
import { PortfolioAPI } from "../../api/portfolio/portfolio-api"
import { OperationsList } from "../../components/portfolio/OperationsComponent"
import { ImageType, PayLayout } from "../../components/portfolio/PayLayout"
import { PortfolioStyles } from "../../components/styles"
import I18n from "../../i18n"
import ROUTES from "../../navigation/routes"
import { Operation } from "../../types/portfolio/types"

type ScreenProps = {
}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
};

type Props = ScreenProps & OwnProps;

/**
 * Portfolio Home Screen
 */
export class PortfolioHomeScreen extends React.Component<Props, never> {

  public static navigationOptions = {
    title: I18n.t("portfolio.portfolio"),
    headerBackTitle: null
  }

  constructor(props: Props) {
    super(props)
  }

  public render(): React.ReactNode {
    const TITLE = I18n.t("portfolio.portfolio")
    const latestOperations: ReadonlyArray<
      Operation
    > = PortfolioAPI.getLatestOperations();
    const subtitles = (PortfolioAPI.getCreditCards().length > 0) ?
      { subtitleLeft: I18n.t("portfolio.paymentMethods"), 
        subtitleRight: I18n.t("portfolio.newPaymentMethod.add") } :
      { subtitle: I18n.t("portfolio.newPaymentMethod.addDescription") };
    return (
      <PayLayout
        navigation={this.props.navigation}
        title={TITLE}
        {...subtitles}
        touchableContent={this.touchableContent()}
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
    )
  }

  private touchableContent(): React.ReactElement<any> {
    const { navigate } = this.props.navigation;
    if (PortfolioAPI.getCreditCards().length > 0) {
      return (
        <View style={PortfolioStyles.container}>
          <TouchableHighlight
            onPress={(): boolean =>
              navigate(ROUTES.PORTFOLIO_CREDITCARDS)
            }
          >
            <Image style={PortfolioStyles.pfcards}
                  source={require("../../../img/portfolio/creditcards.jpg")} />
          </TouchableHighlight>
        </View>
      );
    }
    else {
      return (
        <View style={PortfolioStyles.container}>
          <Button
            bordered
            block
            style={PortfolioStyles.addPaymentMethodButton}
            onPress = { (): boolean => 
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
}

import * as React from "react"

import { Button, Content, Left, Right, Text, View } from "native-base"
import { Image, TouchableHighlight } from "react-native"
import { Grid, Row } from "react-native-easy-grid"
import { NavigationInjectedProps, NavigationScreenProp, NavigationState } from "react-navigation"
import { SimpleLayout } from "../../components/portfolio/SimpleLayout"
import { PortfolioStyles } from "../../components/styles"
import I18n from "../../i18n"
import ROUTES from "../../navigation/routes"
import { Operation, UNKNOWN_OPERATION } from "../../types/portfolio/types"
import { CreditCard} from '../../types/portfolio/CreditCard'

// Images
const cardsImage = require("../../../img/portfolio/single-tab.png")

interface ParamType {
  operation: Operation;
}

interface StateParams extends NavigationState {
  params: ParamType;
}

type OwnProps = {
  navigation: NavigationScreenProp<StateParams>,
  operation: Operation,
  parent: string,
  card: CreditCard
}

type Props = OwnProps & NavigationInjectedProps;

/**
 * Details of transaction
 */
export class OperationDetailsScreen extends React.Component<Props, never> {

  public static navigationOptions = {
    title: I18n.t("portfolio.operationsDetails"),
    headerBackTitle: null
  }

  constructor(props: Props) {
    super(props)
  }

  public render(): React.ReactNode {
    const { navigate } = this.props.navigation
    const { params } = this.props.navigation.state
    const TITLE: string = I18n.t("portfolio.operationsDetails")
    const operation: Operation = params ? params.operation : UNKNOWN_OPERATION
    return (
      <SimpleLayout title={TITLE} touchableContent={this.touchableContent()}>
        <Content style={PortfolioStyles.pfwhite}>
          <Grid>
            <Row>
              <Left>
                <Text>
                  {I18n.t("portfolio.total") + " " + operation.currency}
                </Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.amount}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t("portfolio.payAmount")}</Text>
              </Left>
              <Right>
                <Text>{operation.amount}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text>
                  <Text note>{I18n.t("portfolio.transactionFee")}</Text>
                  <Text note>&nbsp;</Text>
                  <Text note style={PortfolioStyles.pfwhy}>{I18n.t("portfolio.why")}</Text>
                </Text>
              </Left>
              <Right>
                <Text>{operation.transactionCost}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t("portfolio.causal")}</Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.subject}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t("portfolio.recipient")}</Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.recipient}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t("portfolio.date")}</Text>
              </Left>
              <Right>
                <Text>{operation.date}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note>{I18n.t("portfolio.hour")}</Text>
              </Left>
              <Right>
                <Text>{operation.time}</Text>
              </Right>
            </Row>
            <Row>
              <Button
                style={{ marginTop: 20 }}
                block
                success
                onPress={(): boolean => navigate("Login")}
              >
                <Text>{I18n.t("portfolio.seeReceipt")}</Text>
              </Button>
            </Row>
          </Grid>
        </Content>
      </SimpleLayout>
    )
  }

  private touchableContent(): React.ReactNode {
    const { navigate } = this.props.navigation
    return (
      <View style={PortfolioStyles.container}>
        <TouchableHighlight
          onPress={(): boolean => navigate(ROUTES.PORTFOLIO_OPERATION_DETAILS)}
        >
          <Image style={PortfolioStyles.pfsingle} source={cardsImage} />
        </TouchableHighlight>
      </View>
    )
  }


}

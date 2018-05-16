import * as React from "react";

import { Button, Content, Left, Right, Text, View } from "native-base";
import { Image } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { PayLayout } from "../../components/portfolio/pay-layout/PayLayout";
import { topContentTouchable } from "../../components/portfolio/pay-layout/types";
import { PortfolioStyles } from "../../components/styles";
import I18n from "../../i18n";
import { CreditCard } from "../../types/portfolio/CreditCard";
import { Operation, UNKNOWN_OPERATION } from "../../types/portfolio/types";

// Images
const cardsImage = require("../../../img/portfolio/single-tab.png");

interface ParamType {
  readonly operation: Operation;
}

interface StateParams extends NavigationState {
  readonly params: ParamType;
}

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<StateParams>;
  operation: Operation;
  parent: string;
  card: CreditCard;
}>;

type Props = OwnProps & NavigationInjectedProps;

/**
 * Details of transaction
 */
export class OperationDetailsScreen extends React.Component<Props, never> {
  public static navigationOptions = {
    title: I18n.t("portfolio.operationsDetails"),
    headerBackTitle: null
  };

  constructor(props: Props) {
    super(props);
  }

  private touchableContent(): React.ReactElement<any> {
    return (
      <View style={PortfolioStyles.container}>
        <Image
          style={PortfolioStyles.pfsingle}
          source={cardsImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  public render(): React.ReactNode {
    const { navigate } = this.props.navigation;
    const { params } = this.props.navigation.state;
    const TITLE: string = I18n.t("portfolio.operationsDetails");
    const operation: Operation = params ? params.operation : UNKNOWN_OPERATION;
    const topContent = topContentTouchable(this.touchableContent());
    return (
      <PayLayout
        navigation={this.props.navigation}
        title={TITLE}
        topContent={topContent}
      >
        <Content style={PortfolioStyles.pfwhite}>
          <Grid>
            <Row>
              <Left>
                <Text>
                  {`${I18n.t("portfolio.total")} ${operation.currency}`}
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
                <Text note={true}>{I18n.t("portfolio.payAmount")}</Text>
              </Left>
              <Right>
                <Text>{operation.amount}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text>
                  <Text note={true}>{I18n.t("portfolio.transactionFee")}</Text>
                  <Text note={true}>&nbsp;</Text>
                  <Text note={true} style={PortfolioStyles.pfwhy}>
                    {I18n.t("portfolio.why")}
                  </Text>
                </Text>
              </Left>
              <Right>
                <Text>{operation.transactionCost}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note={true}>{I18n.t("portfolio.causal")}</Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.subject}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note={true}>{I18n.t("portfolio.recipient")}</Text>
              </Left>
              <Right>
                <Text style={PortfolioStyles.boldStyle}>
                  {operation.recipient}
                </Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note={true}>{I18n.t("portfolio.date")}</Text>
              </Left>
              <Right>
                <Text>{operation.date}</Text>
              </Right>
            </Row>
            <Row>
              <Left>
                <Text note={true}>{I18n.t("portfolio.hour")}</Text>
              </Left>
              <Right>
                <Text>{operation.time}</Text>
              </Right>
            </Row>
            <Row>
              <Button
                style={{ marginTop: 20 }}
                block={true}
                success={true}
                onPress={(): boolean => navigate("Login")}
              >
                <Text>{I18n.t("portfolio.seeReceipt")}</Text>
              </Button>
            </Row>
          </Grid>
        </Content>
      </PayLayout>
    );
  }
}

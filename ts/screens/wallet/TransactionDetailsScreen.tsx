/**
 * Transaction details screen, displaying
 * a list of information available about a
 * specific transaction.
 */
import * as React from "react";

import { Button, Content, Left, Right, Text, View } from "native-base";
import { Image, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { WalletStyles } from "../../components/styles/wallet";
import { topContentTouchable } from "../../components/wallet/layout/types";
import { WalletLayout } from "../../components/wallet/layout/WalletLayout";
import I18n from "../../i18n";
import { WalletTransaction } from "../../types/wallet";

const cardsImage = require("../../../img/wallet/single-tab.png");

interface ParamType {
  readonly transaction: WalletTransaction;
}

interface StateParams extends NavigationState {
  readonly params: ParamType;
}

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<StateParams>;
}>;

type Props = OwnProps & NavigationInjectedProps;

const styles = StyleSheet.create({
  rowStyle: {
    paddingTop: 10
  },
  alignedRight: {
    textAlign: "right"
  }
});

/**
 * Details of transaction
 */
export class TransactionDetailsScreen extends React.Component<Props, never> {
  constructor(props: Props) {
    super(props);
  }

  private touchableContent(): React.ReactElement<any> {
    // TODO: replace this with actual component @https://www.pivotaltracker.com/story/show/157422715
    return (
      <View style={WalletStyles.container}>
        <Image
          style={WalletStyles.pfSingle}
          source={cardsImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  public render(): React.ReactNode {
    const { navigate } = this.props.navigation;
    const operation: WalletTransaction = this.props.navigation.state.params
      .transaction;
    const topContent = topContentTouchable(this.touchableContent());
    return (
      <WalletLayout
        headerTitle={I18n.t("wallet.transaction")}
        allowGoBack={true}
        navigation={this.props.navigation}
        title={I18n.t("wallet.transactionDetails")}
        topContent={topContent}
      >
        <Content style={WalletStyles.whiteContent}>
          <Grid>
            <Row style={styles.rowStyle}>
              <Left>
                <Text>{`${I18n.t("wallet.total")} ${operation.currency}`}</Text>
              </Left>
              <Right>
                <Text bold={true}>{operation.amount}</Text>
              </Right>
            </Row>
            <Row style={styles.rowStyle}>
              <Left>
                <Text note={true}>{I18n.t("wallet.payAmount")}</Text>
              </Left>
              <Right>
                <Text>{operation.amount}</Text>
              </Right>
            </Row>
            <Row style={styles.rowStyle}>
              <Left>
                <Text>
                  <Text note={true}>{I18n.t("wallet.transactionFee")}</Text>
                  <Text note={true}>&nbsp;</Text>
                  <Text note={true} style={WalletStyles.whyLink}>
                    {I18n.t("wallet.why")}
                  </Text>
                </Text>
              </Left>
              <Right>
                <Text>{operation.transactionCost}</Text>
              </Right>
            </Row>
            <Row style={styles.rowStyle}>
              <Left>
                <Text note={true}>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</Text>
              </Left>
              <Right>
                <Text bold={true} style={styles.alignedRight}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
              </Right>
            </Row>
            <Row style={styles.rowStyle}>
              <Left>
                <Text note={true}>{I18n.t("wallet.recipient")}</Text>
              </Left>
              <Right>
                <Text bold={true}>{operation.recipient}</Text>
              </Right>
            </Row>
            <Row style={styles.rowStyle}>
              <Left>
                <Text note={true}>{I18n.t("wallet.date")}</Text>
              </Left>
              <Right>
                <Text>{operation.date}</Text>
              </Right>
            </Row>
            <Row style={styles.rowStyle}>
              <Left>
                <Text note={true}>{I18n.t("wallet.time")}</Text>
              </Left>
              <Right>
                <Text>{operation.time}</Text>
              </Right>
            </Row>
            <Row style={styles.rowStyle}>
              <Button
                style={{ marginTop: 20 }}
                block={true}
                success={true}
                onPress={(): boolean => navigate("")}
              >
                <Text>{I18n.t("wallet.seeReceipt")}</Text>
              </Button>
            </Row>
          </Grid>
        </Content>
      </WalletLayout>
    );
  }
}

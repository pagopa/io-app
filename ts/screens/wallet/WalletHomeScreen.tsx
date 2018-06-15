/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { Button, H1, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";

import { Col, Grid, Row } from "react-native-easy-grid";
import { TransactionsList } from "../../components/wallet/TransactionsList";
import { CardType, WalletLayout } from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { CreditCard } from "../../types/CreditCard";
import { WalletTransaction } from "../../types/wallet";

type ScreenProps = {};

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ScreenProps & OwnProps;

const styles = StyleSheet.create({
  twoRowsBanner: {
    height: 120 // 60 x 2
  },
  threeRowsBanner: {
    height: 180 // 60 x 3
  },
  bottomAlignedItems: {
    alignItems: "flex-end"
  }
});

/**
 * Wallet Home Screen
 */
export class WalletHomeScreen extends React.Component<Props, never> {
  private withCardsHeader() {
    return (
      <Grid style={styles.threeRowsBanner}>
        <Col size={2}>
          <Row />
          <Row style={styles.bottomAlignedItems}>
            <H1 style={WalletStyles.white}>{I18n.t("wallet.wallet")}</H1>
          </Row>
          <Row>
            <Left>
              <Text bold={true} style={WalletStyles.white}>
                {I18n.t("wallet.paymentMethods")}
              </Text>
            </Left>
          </Row>
        </Col>
        <Col>
          <Row size={2}>
            <Image
              source={require("../../../img/wallet/wallet-icon.png")}
              style={WalletStyles.pfImage}
            />
          </Row>
          <Row>
            <Right>
              <Text
                onPress={(): boolean =>
                  this.props.navigation.navigate(
                    ROUTES.WALLET_ADD_PAYMENT_METHOD
                  )
                }
                style={WalletStyles.white}
              >
                {I18n.t("wallet.newPaymentMethod.add")}
              </Text>
            </Right>
          </Row>
        </Col>
      </Grid>
    );
  }

  private withoutCardsHeader() {
    return (
      <View>
        <Grid style={styles.twoRowsBanner}>
          <Col size={2}>
            <Row />
            <Row style={styles.bottomAlignedItems}>
              <H1 style={WalletStyles.white}>{I18n.t("wallet.wallet")}</H1>
            </Row>
          </Col>
          <Col>
            <Row size={2}>
              <Image
                source={require("../../../img/wallet/wallet-icon.png")}
                style={WalletStyles.pfImage}
              />
            </Row>
          </Col>
        </Grid>
        <View spacer={true} />
        <Text style={WalletStyles.white}>
          {I18n.t("wallet.newPaymentMethod.addDescription")}
        </Text>
        <View spacer={true} />
        <View style={WalletStyles.container}>
          <Button
            bordered={true}
            block={true}
            style={WalletStyles.addPaymentMethodButton}
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD)
            }
          >
            <Text style={WalletStyles.addPaymentMethodText}>
              {I18n.t("wallet.newPaymentMethod.addButton")}
            </Text>
          </Button>
          <View spacer={true} />
        </View>
      </View>
    );
  }

  public render(): React.ReactNode {
    const latestTransactions: ReadonlyArray<
      WalletTransaction
    > = WalletAPI.getLatestTransactions();

    const cards: ReadonlyArray<CreditCard> = WalletAPI.getCreditCards();
    const showCards = cards.length > 0;

    // TODO: cards list is currently mocked, will be implemented properly @https://www.pivotaltracker.com/story/show/157422715
    const headerContents = showCards
      ? this.withCardsHeader()
      : this.withoutCardsHeader();

    return (
      <WalletLayout
        title={I18n.t("wallet.wallet")}
        navigation={this.props.navigation}
        headerContents={headerContents}
        cardType={showCards ? CardType.FAN : CardType.NONE}
      >
        <TransactionsList
          title={I18n.t("wallet.latestTransactions")}
          totalAmount={I18n.t("wallet.total")}
          transactions={latestTransactions}
          navigation={this.props.navigation}
        />
      </WalletLayout>
    );
  }
}

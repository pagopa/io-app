/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { Button, H1, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { WalletStyles } from "../../components/styles/wallet";
import TransactionsList, {
  TransactionsDisplayed
} from "../../components/wallet/TransactionsList";
import {
  CardEnum,
  CardType,
  WalletLayout
} from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import { fetchTransactionsRequest } from "../../store/actions/wallet/transactions";
import { GlobalState } from "../../store/reducers/types";
import { creditCardsSelector } from "../../store/reducers/wallet/cards";
import { CreditCard } from "../../types/CreditCard";

type ReduxMappedStateProps = Readonly<{
  cards: ReadonlyArray<CreditCard>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  // temporary
  loadTransactions: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReduxMappedStateProps & ReduxMappedDispatchProps & OwnProps;

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
class WalletHomeScreen extends React.Component<Props, never> {
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

  public componentDidMount() {
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // WIP WIP create pivotal story
    this.props.loadTransactions();
  }

  // check the cards to display (none, one or two cards)
  private getCardType(): CardType {
    const cards = this.props.cards;

    switch (this.props.cards.length) {
      case 0:
        return { type: CardEnum.NONE };
      case 1:
        return { type: CardEnum.HEADER, card: cards[0] };
      default:
        return { type: CardEnum.FAN, cards: [cards[0], cards[1]] };
    }
  }

  public render(): React.ReactNode {
    const showCards = this.props.cards.length > 0;
    const headerContents = showCards
      ? this.withCardsHeader()
      : this.withoutCardsHeader();

    return (
      <WalletLayout
        title={I18n.t("wallet.wallet")}
        navigation={this.props.navigation}
        headerContents={headerContents}
        cardType={this.getCardType()}
        allowGoBack={false}
      >
        <TransactionsList
          title={I18n.t("wallet.latestTransactions")}
          totalAmount={I18n.t("wallet.total")}
          navigation={this.props.navigation}
          display={TransactionsDisplayed.LATEST}
        />
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  cards: creditCardsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  loadTransactions: () => dispatch(fetchTransactionsRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletHomeScreen);

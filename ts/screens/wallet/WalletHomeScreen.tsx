/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { Button, H1, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { WalletStyles } from "../../components/styles/wallet";
import TransactionsList, {
  TransactionsDisplayed
} from "../../components/wallet/TransactionsList";
import { CardEnum, CardType } from "../../components/wallet/WalletLayout";
import WalletLayout from "../../components/wallet/WalletLayout";
import { DEFAULT_APPLICATION_NAME } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import { fetchTransactionsRequest } from "../../store/actions/wallet/transactions";
import { fetchWalletsRequest } from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import { walletsSelector } from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";

type ReduxMappedStateProps = Readonly<{
  cards: ReadonlyArray<Wallet>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  // temporary
  loadTransactions: () => void;
  loadWallets: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReduxMappedStateProps & ReduxMappedDispatchProps & OwnProps;

const styles = StyleSheet.create({
  flex: {
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  inLineSpace: {
    lineHeight: 20
  }
});

/**
 * Wallet Home Screen
 */
class WalletHomeScreen extends React.Component<Props, never> {
  private header() {
    return (
      <Row style={styles.flex}>
        <H1 style={WalletStyles.white}>{I18n.t("wallet.wallet")}</H1>
        <Image source={require("../../../img/wallet/bank.png")} />
      </Row>
    );
  }

  private withCardsHeader() {
    return (
      <Grid>
        {this.header()}
        <View spacer={true} />
        <Row>
          <Left>
            <Text bold={true} style={WalletStyles.white}>
              {I18n.t("wallet.paymentMethods")}
            </Text>
          </Left>
          <Right>
            <Text
              onPress={(): boolean =>
                this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD)
              }
              style={WalletStyles.white}
            >
              {`+ ${I18n.t("wallet.newPaymentMethod.add")}`}
            </Text>
          </Right>
        </Row>
      </Grid>
    );
  }

  private withoutCardsHeader() {
    return (
      <Grid>
        {this.header()}
        <View spacer={true} />
        <Row>
          <Text note={true} style={[WalletStyles.white, styles.inLineSpace]}>
            {I18n.t("wallet.newPaymentMethod.addDescription")}
          </Text>
        </Row>
        <Row>
          <View spacer={true} />
        </Row>
        <Row>
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
          </View>
        </Row>
        <Row>
          <View spacer={true} />
        </Row>
      </Grid>
    );
  }

  public componentDidMount() {
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // WIP WIP create pivotal story
    this.props.loadWallets();
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
    const moreCards = this.props.cards.length > 1;
    const headerContents = showCards
      ? this.withCardsHeader()
      : this.withoutCardsHeader();

    return (
      <WalletLayout
        title={DEFAULT_APPLICATION_NAME}
        navigation={this.props.navigation}
        headerContents={headerContents}
        cardType={this.getCardType()}
        allowGoBack={false}
        moreCards={moreCards}
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
  cards: walletsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  loadTransactions: () => dispatch(fetchTransactionsRequest()),
  loadWallets: () => dispatch(fetchWalletsRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletHomeScreen);

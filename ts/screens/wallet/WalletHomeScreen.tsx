/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { Button, H1, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect, Dispatch } from "react-redux";
import { WalletStyles } from "../../components/styles/wallet";

import { Col, Grid, Row } from "react-native-easy-grid";
import TransactionsList, {
  TransactionsDisplayed
} from "../../components/wallet/TransactionsList";
import { CardEnum, WalletLayout } from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { fetchCardsRequest } from "../../store/actions/wallet/cards";
import { fetchTransactionsRequest } from "../../store/actions/wallet/transactions";
import { GlobalState } from "../../store/reducers/types";
import { creditCardsSelector } from "../../store/reducers/wallet/cards";

type ScreenProps = {};

type ReduxMappedStateProps = Readonly<{
  cardsNumber: number;
}>;

type ReduxMappedDispatchProps = Readonly<{
  // temporary
  loadTransactions: () => void;
  loadCards: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReduxMappedStateProps &
  ReduxMappedDispatchProps &
  ScreenProps &
  OwnProps;

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
              this.props.navigation.navigate(ROUTES.WALLET_CREDITCARDS)
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
    this.props.loadCards();
    this.props.loadTransactions();
  }

  public render(): React.ReactNode {
    const showCards = this.props.cardsNumber > 0;

    // TODO: cards list is currently mocked, will be implemented properly @https://www.pivotaltracker.com/story/show/157422715
    const headerContents = showCards
      ? this.withCardsHeader()
      : this.withoutCardsHeader();

    return (
      <WalletLayout
        title={I18n.t("wallet.wallet")}
        navigation={this.props.navigation}
        headerContents={headerContents}
        cardType={
          showCards
            ? { type: CardEnum.FAN, cards: [] }
            : { type: CardEnum.NONE }
        }
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
  cardsNumber: creditCardsSelector(state).length
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  loadTransactions: () => dispatch(fetchTransactionsRequest()),
  loadCards: () => dispatch(fetchCardsRequest())
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletHomeScreen);

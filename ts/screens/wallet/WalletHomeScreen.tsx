/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Button, H1, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { none } from "fp-ts/lib/Option";
import { WalletStyles } from "../../components/styles/wallet";
import BoxedRefreshIndicator from "../../components/ui/BoxedRefreshIndicator";
import { AddPaymentMethodButton } from "../../components/wallet/AddPaymentMethodButton";
import CardsFan from "../../components/wallet/card/CardsFan";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import { DEFAULT_APPLICATION_NAME } from "../../config";
import I18n from "../../i18n";
import {
  navigateToPaymentScanQrCode,
  navigateToTransactionDetailsScreen,
  navigateToWalletAddPaymentMethod,
  navigateToWalletList
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { fetchTransactionsRequest } from "../../store/actions/wallet/transactions";
import { fetchWalletsRequest } from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import { latestTransactionsSelector } from "../../store/reducers/wallet/transactions";
import { walletsSelector } from "../../store/reducers/wallet/wallets";
import { Transaction } from "../../types/pagopa";

type ReduxMappedStateProps = Readonly<{
  potWallets: ReturnType<typeof walletsSelector>;
  potTransactions: ReturnType<typeof latestTransactionsSelector>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  navigateToWalletAddPaymentMethod: () => void;
  navigateToWalletList: () => void;
  navigateToPaymentScanQrCode: () => void;
  navigateToTransactionDetailsScreen: (transaction: Transaction) => void;
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
  },
  refreshBox: {
    height: 100,
    flex: 1,
    alignContent: "center",
    justifyContent: "center"
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
            <AddPaymentMethodButton
              onPress={this.props.navigateToWalletAddPaymentMethod}
            />
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
              onPress={this.props.navigateToWalletAddPaymentMethod}
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

  private loadingWalletsHeader() {
    return (
      <View>
        {this.header()}
        <View spacer={true} />
        <BoxedRefreshIndicator
          caption={
            <Text style={[WalletStyles.white, styles.inLineSpace]}>
              {I18n.t("wallet.walletLoadMessage")}
            </Text>
          }
        />
      </View>
    );
  }

  private errorWalletsHeader() {
    return (
      <View>
        {this.header()}
        <View spacer={true} />
        <Text note={true} style={[WalletStyles.white, styles.inLineSpace]}>
          {I18n.t("wallet.walletLoadFailure")}
        </Text>
        <View spacer={true} />
        <Button block={true} danger={true} onPress={this.props.loadWallets}>
          <Text style={WalletStyles.addPaymentMethodText}>
            {I18n.t("global.buttons.retry")}
          </Text>
        </Button>
        <View spacer={true} />
      </View>
    );
  }

  public componentDidMount() {
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // WIP WIP create pivotal story
    this.props.loadWallets();
    this.props.loadTransactions();
  }

  public render(): React.ReactNode {
    const { potWallets, potTransactions } = this.props;
    const wallets = pot.getOrElse(potWallets, []);
    const headerContents = pot.isLoading(potWallets)
      ? this.loadingWalletsHeader()
      : pot.isError(potWallets)
        ? this.errorWalletsHeader()
        : wallets.length > 0
          ? this.withCardsHeader()
          : this.withoutCardsHeader();

    return (
      <WalletLayout
        title={DEFAULT_APPLICATION_NAME}
        headerContents={headerContents}
        displayedWallets={
          wallets.length === 0 ? null : (
            <CardsFan
              wallets={
                wallets.length === 1 ? [wallets[0]] : [wallets[0], wallets[1]]
              }
              navigateToWalletList={this.props.navigateToWalletList}
            />
          )
        }
        onNewPaymentPress={
          pot.isSome(potWallets)
            ? this.props.navigateToPaymentScanQrCode
            : undefined
        }
        allowGoBack={false}
      >
        {pot.isError(potTransactions) ? (
          <React.Fragment>
            <View spacer={true} />
            <Text note={true} style={[WalletStyles.white, styles.inLineSpace]}>
              {I18n.t("wallet.transactionsLoadFailure")}
            </Text>
            <Button
              block={true}
              danger={true}
              onPress={this.props.loadTransactions}
            >
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </Button>
          </React.Fragment>
        ) : (
          <TransactionsList
            title={I18n.t("wallet.latestTransactions")}
            totalAmount={I18n.t("wallet.total")}
            transactions={potTransactions}
            navigateToTransactionDetails={
              this.props.navigateToTransactionDetailsScreen
            }
          />
        )}
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  potWallets: walletsSelector(state),
  potTransactions: latestTransactionsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  navigateToWalletAddPaymentMethod: () =>
    dispatch(navigateToWalletAddPaymentMethod({ inPayment: none })),
  navigateToWalletList: () => dispatch(navigateToWalletList()),
  navigateToPaymentScanQrCode: () => dispatch(navigateToPaymentScanQrCode()),
  navigateToTransactionDetailsScreen: (transaction: Transaction) =>
    dispatch(
      navigateToTransactionDetailsScreen({
        transaction,
        isPaymentCompletedTransaction: false
      })
    ),
  loadTransactions: () => dispatch(fetchTransactionsRequest()),
  loadWallets: () => dispatch(fetchWalletsRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletHomeScreen);

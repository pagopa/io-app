/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import BoxedRefreshIndicator from "../../components/ui/BoxedRefreshIndicator";
import H5 from "../../components/ui/H5";
import IconFont from "../../components/ui/IconFont";
import { AddPaymentMethodButton } from "../../components/wallet/AddPaymentMethodButton";
import CardsFan from "../../components/wallet/card/CardsFan";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import {
  navigateToPaymentScanQrCode,
  navigateToTransactionDetailsScreen,
  navigateToWalletAddPaymentMethod,
  navigateToWalletList
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  fetchTransactionsRequest,
  readTransaction
} from "../../store/actions/wallet/transactions";
import { fetchWalletsRequest } from "../../store/actions/wallet/wallets";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { latestTransactionsSelector } from "../../store/reducers/wallet/transactions";
import { walletsSelector } from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Transaction, Wallet } from "../../types/pagopa";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const styles = StyleSheet.create({
  inLineSpace: {
    lineHeight: 20
  },

  white: {
    color: variables.colorWhite
  },

  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "transparent"
  },

  flex1: {
    flex: 1
  },

  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  emptyListWrapper: {
    padding: variables.contentPadding,
    alignItems: "center"
  },

  emptyListContentTitle: {
    paddingBottom: variables.contentPadding / 2,
    fontSize: variables.fontSizeSmall
  },

  bordercColorBrandGray: {
    borderColor: variables.brandGray
  },

  colorBrandGray: {
    color: variables.brandGray
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  },

  brandLightGray: {
    color: variables.brandLightGray
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  }
});

/**
 * Wallet Home Screen
 */
class WalletHomeScreen extends React.Component<Props, never> {
  public componentDidMount() {
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // WIP WIP create pivotal story
    this.props.loadWallets();
    this.props.loadTransactions();
  }

  private cardHeader(isError: boolean = false) {
    return (
      <View style={styles.flexRow}>
        <View>
          <H5 style={styles.brandLightGray}>
            {I18n.t("wallet.paymentMethods")}
          </H5>
        </View>
        {!isError && (
          <View>
            <AddPaymentMethodButton
              onPress={this.props.navigateToWalletAddPaymentMethod}
            />
          </View>
        )}
      </View>
    );
  }

  private cardPreview(wallets: any) {
    return (
      <View>
        {this.cardHeader()}
        <View spacer={true} />
        <CardsFan
          wallets={
            wallets.length === 1 ? [wallets[0]] : [wallets[0], wallets[1]]
          }
          navigateToWalletList={this.props.navigateToWalletList}
        />
      </View>
    );
  }

  private withoutCardsHeader() {
    return (
      <Grid>
        <Row>
          <Text note={true} white={true} style={styles.inLineSpace}>
            {I18n.t("wallet.newPaymentMethod.addDescription")}
          </Text>
        </Row>
        <Row>
          <View spacer={true} />
        </Row>
        <Row>
          <View style={styles.container}>
            <Button
              bordered={true}
              block={true}
              style={styles.bordercColorBrandGray}
              onPress={this.props.navigateToWalletAddPaymentMethod}
            >
              <Text bold={true} style={styles.colorBrandGray}>
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
        <BoxedRefreshIndicator
          caption={
            <Text white={true} style={styles.inLineSpace}>
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
        {this.cardHeader(true)}
        <View spacer={true} />
        <Text style={[styles.white, styles.inLineSpace]}>
          {I18n.t("wallet.walletLoadFailure")}
        </Text>
        <View spacer={true} />
        <Button
          block={true}
          light={true}
          bordered={true}
          small={true}
          onPress={this.props.loadWallets}
        >
          <Text primary={true}>{I18n.t("global.buttons.retry")}</Text>
        </Button>
        <View spacer={true} />
      </View>
    );
  }

  private transactionError() {
    return (
      <Content
        scrollEnabled={false}
        style={[styles.noBottomPadding, styles.whiteBg, styles.flex1]}
      >
        <View spacer={true} />
        <H5 style={styles.brandDarkGray}>{I18n.t("wallet.transactions")}</H5>
        <View spacer={true} large={true} />
        <Text style={[styles.inLineSpace, styles.brandDarkGray]}>
          {I18n.t("wallet.transactionsLoadFailure")}
        </Text>
        <View spacer={true} />
        <Button
          block={true}
          light={true}
          bordered={true}
          small={true}
          onPress={this.props.loadTransactions}
        >
          <Text primary={true}>{I18n.t("global.buttons.retry")}</Text>
        </Button>
        <View spacer={true} large={true} />
      </Content>
    );
  }

  private listEmptyComponent() {
    return (
      <Content scrollEnabled={false} noPadded={true}>
        <View style={styles.emptyListWrapper}>
          <Text style={styles.emptyListContentTitle}>
            {I18n.t("wallet.noTransactionsInWalletHome")}
          </Text>
          <Image
            source={require("../../../img/messages/empty-transaction-list-icon.png")}
          />
        </View>
      </Content>
    );
  }

  private transactionList(
    potTransactions: pot.Pot<ReadonlyArray<Transaction>, Error>
  ) {
    return (
      <TransactionsList
        title={I18n.t("wallet.latestTransactions")}
        amount={I18n.t("wallet.amount")}
        transactions={potTransactions}
        navigateToTransactionDetails={
          this.props.navigateToTransactionDetailsScreen
        }
        readTransactions={this.props.readTransactions}
        ListEmptyComponent={this.listEmptyComponent()}
      />
    );
  }

  private footerButton(potWallets: pot.Pot<ReadonlyArray<Wallet>, Error>) {
    return (
      <Button
        block={true}
        onPress={
          pot.isSome(potWallets)
            ? this.props.navigateToPaymentScanQrCode
            : undefined
        }
      >
        <IconFont name="io-qr" style={styles.white} />
        <Text>{I18n.t("wallet.payNotice")}</Text>
      </Button>
    );
  }

  public render(): React.ReactNode {
    const { potWallets, potTransactions } = this.props;
    const wallets = pot.getOrElse(potWallets, []);
    const headerContent = pot.isLoading(potWallets)
      ? this.loadingWalletsHeader()
      : pot.isError(potWallets)
        ? this.errorWalletsHeader()
        : wallets.length > 0
          ? this.cardPreview(wallets)
          : this.withoutCardsHeader();

    const transactionContent = pot.isError(potTransactions)
      ? this.transactionError()
      : this.transactionList(potTransactions);

    const footerContent = this.footerButton(potWallets);

    return (
      <WalletLayout
        title={I18n.t("wallet.wallet")}
        allowGoBack={false}
        hasDynamicSubHeader={true}
        topContent={headerContent}
        footerContent={footerContent}
      >
        {transactionContent}
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  potWallets: walletsSelector(state),
  potTransactions: latestTransactionsSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  readTransactions: state.entities.transactionsRead
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletAddPaymentMethod: () =>
    dispatch(navigateToWalletAddPaymentMethod({ inPayment: none })),
  navigateToWalletList: () => dispatch(navigateToWalletList()),
  navigateToPaymentScanQrCode: () => dispatch(navigateToPaymentScanQrCode()),
  navigateToTransactionDetailsScreen: (transaction: Transaction) => {
    dispatch(readTransaction(transaction));
    dispatch(
      navigateToTransactionDetailsScreen({
        transaction,
        isPaymentCompletedTransaction: false
      })
    );
  },
  loadTransactions: () => dispatch(fetchTransactionsRequest()),
  loadWallets: () => dispatch(fetchWalletsRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletHomeScreen);

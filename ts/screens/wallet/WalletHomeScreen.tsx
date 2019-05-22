/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Content, H1, H3, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { none } from "fp-ts/lib/Option";
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
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { latestTransactionsSelector } from "../../store/reducers/wallet/transactions";
import { walletsSelector } from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const styles = StyleSheet.create({
  flex: {
    alignItems: "flex-end",
    justifyContent: "space-between"
  },

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
  emptyListWrapper: {
    padding: variables.contentPadding,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingBottom: variables.contentPadding / 2,
    fontSize: variables.fontSizeSmall
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  },

  bordercColorBrandGray: {
    borderColor: variables.brandGray
  },

  colorBrandGray: {
    color: variables.brandGray
  },

  whiteContent: {
    backgroundColor: variables.colorWhite,
    flex: 1
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  }
});

const ListEmptyComponent = (
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

/**
 * Wallet Home Screen
 */
class WalletHomeScreen extends React.Component<Props, never> {
  private header() {
    return (
      <Row style={styles.flex}>
        <H1 style={styles.white}>{I18n.t("wallet.wallet")}</H1>
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
            <Text bold={true} white={true}>
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
        {this.header()}
        <View spacer={true} />
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
        {this.withCardsHeader()}
        <View spacer={true} large={true} />
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
        isPagoPATestEnabled={this.props.isPagoPATestEnabled}
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
          <Content
            scrollEnabled={false}
            style={[styles.noBottomPadding, styles.whiteContent]}
          >
            <View spacer={true} />
            <H3>{I18n.t("wallet.transactions")}</H3>
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
        ) : (
          <TransactionsList
            title={I18n.t("wallet.latestTransactions")}
            totalAmount={I18n.t("wallet.total")}
            transactions={potTransactions}
            navigateToTransactionDetails={
              this.props.navigateToTransactionDetailsScreen
            }
            ListEmptyComponent={ListEmptyComponent}
          />
        )}
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  potWallets: walletsSelector(state),
  potTransactions: latestTransactionsSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
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

import { fromNullable, fromPredicate, none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, RefreshControl, StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import {
  NavigationEventSubscription,
  NavigationInjectedProps
} from "react-navigation";
import { connect } from "react-redux";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import BoxedRefreshIndicator from "../../components/ui/BoxedRefreshIndicator";
import H5 from "../../components/ui/H5";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { AddPaymentMethodButton } from "../../components/wallet/AddPaymentMethodButton";
import CardsFan from "../../components/wallet/card/CardsFan";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import RequestBonus from "../../features/bonusVacanze/components/RequestBonus";
import { Bonus } from "../../features/bonusVacanze/utils";
import I18n from "../../i18n";
import {
  navigateBack,
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
import { transactionsReadSelector } from "../../store/reducers/entities";
import { navSelector } from "../../store/reducers/navigationHistory";
import {
  paymentsHistorySelector,
  PaymentsHistoryState
} from "../../store/reducers/payments/history";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import {
  areMoreTransactionsAvailable,
  getTransactionsLoadedLength,
  latestTransactionsSelector
} from "../../store/reducers/wallet/transactions";
import { walletsSelector } from "../../store/reducers/wallet/wallets";
import customVariables from "../../theme/variables";
import variables from "../../theme/variables";
import { Transaction, Wallet } from "../../types/pagopa";
import { isUpdateNeeded } from "../../utils/appVersion";
import { getCurrentRouteKey } from "../../utils/navigation";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";

type NavigationParams = Readonly<{
  newMethodAdded: boolean;
  keyFrom?: string;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationInjectedProps<NavigationParams> &
  LightModalContextInterface;

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
  },
  center: {
    alignSelf: "center"
  },
  end: {
    alignSelf: "flex-end"
  },

  centered: {
    textAlign: "center"
  },
  textStyleHelp: {
    lineHeight: 18,
    fontSize: 13
  }
});

const BONUS: Bonus = {
  type: "Bonus Vacanze",
  code: "ABCDE123XYZ",
  max_amount: 500,
  tax_benefit: 300,
  activated_at: new Date("2020-07-04T12:20:00.000Z")
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.contextualHelpTitle",
  body: "wallet.contextualHelpContent"
};

/**
 * Wallet home screen, with a list of recent transactions and payment methods,
 * a "pay notice" button and payment methods info/button to add new ones
 */
class WalletHomeScreen extends React.PureComponent<Props> {
  get newMethodAdded() {
    return this.props.navigation.getParam("newMethodAdded");
  }

  get navigationKeyFrom() {
    return this.props.navigation.getParam("keyFrom");
  }

  private navListener?: NavigationEventSubscription;

  private handleBackPress = () => {
    fromPredicate((cond: boolean) => cond)(this.newMethodAdded).foldL(
      () => {
        this.props.navigateBack();
      },
      _ => {
        fromNullable(this.navigationKeyFrom).foldL(
          () => {
            this.props.navigation.setParams({ newMethodAdded: false });
            this.props.navigateToWalletList();
          },
          k => {
            this.props.navigateBack(k);
          }
        );
      }
    );
    return true;
  };

  public componentDidMount() {
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // https://www.pivotaltracker.com/story/show/168836972

    this.props.loadWallets();
    this.props.loadTransactions(this.props.transactionsLoadedLength);
    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "light-content",
        customVariables.brandDarkGray
      );
    }); // tslint:disable-line no-object-mutation
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    if (this.navListener) {
      this.navListener.remove();
    }
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
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
              onPress={() =>
                this.props.navigateToWalletAddPaymentMethod(
                  getCurrentRouteKey(this.props.nav)
                )
              }
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

  private withoutCardsHeader(hasNotSupportedWalletsOnly: boolean) {
    return (
      <Grid>
        <Row>
          <Text note={true} white={true} style={styles.inLineSpace}>
            {I18n.t("wallet.newPaymentMethod.addDescription")}
            {hasNotSupportedWalletsOnly && (
              <Text note={true} white={true} bold={true}>
                {` ${I18n.t("wallet.newPaymentMethod.walletAlert")}`}
              </Text>
            )}
          </Text>
        </Row>
        <Row />
        <Row>
          <View spacer={true} />
        </Row>
        <Row>
          <View style={styles.container}>
            <ButtonDefaultOpacity
              block={true}
              whiteBordered={true}
              onPress={() =>
                this.props.navigateToWalletAddPaymentMethod(
                  getCurrentRouteKey(this.props.nav)
                )
              }
              activeOpacity={1}
            >
              <Text bold={true}>
                {I18n.t("wallet.newPaymentMethod.addButton")}
              </Text>
            </ButtonDefaultOpacity>
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
        <ButtonDefaultOpacity
          block={true}
          light={true}
          bordered={true}
          small={true}
          onPress={this.props.loadWallets}
        >
          <Text primary={true}>{I18n.t("global.buttons.retry")}</Text>
        </ButtonDefaultOpacity>
        <View spacer={true} />
      </View>
    );
  }

  private helpMessage = (alignCenter: boolean = false): React.ReactNode => (
    <React.Fragment>
      <View spacer={true} large={true} />
      <Text xsmall={true} style={alignCenter ? styles.centered : undefined}>
        {`${I18n.t("wallet.transactionHelpMessage.text1")} `}
        <Text
          xsmall={true}
          style={alignCenter ? styles.centered : undefined}
          bold={true}
        >
          {I18n.t("wallet.transactionHelpMessage.text2")}
        </Text>
        {` ${I18n.t("wallet.transactionHelpMessage.text3")}`}
      </Text>
    </React.Fragment>
  );

  private transactionError(potPayments: PaymentsHistoryState) {
    return (
      <Content
        scrollEnabled={false}
        style={[styles.noBottomPadding, styles.whiteBg, styles.flex1]}
      >
        {this.helpMessage()}
        {potPayments.length > 0 && this.helpMessage()}
        <View spacer={true} large={true} />
        <Text style={[styles.inLineSpace, styles.brandDarkGray]}>
          {I18n.t("wallet.transactionsLoadFailure")}
        </Text>
        <View spacer={true} />
        <ButtonDefaultOpacity
          block={true}
          light={true}
          bordered={true}
          small={true}
          onPress={() =>
            this.props.loadTransactions(this.props.transactionsLoadedLength)
          }
        >
          <Text primary={true}>{I18n.t("global.buttons.retry")}</Text>
        </ButtonDefaultOpacity>
        <View spacer={true} large={true} />
      </Content>
    );
  }

  private listEmptyComponent(potPayments: PaymentsHistoryState) {
    return (
      <Content scrollEnabled={false} noPadded={true}>
        <View style={styles.emptyListWrapper}>
          {potPayments.length > 0 && this.helpMessage(true)}
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

  private handleLoadMoreTransactions = () => {
    this.props.loadTransactions(this.props.transactionsLoadedLength);
  };

  private transactionList(
    potTransactions: pot.Pot<ReadonlyArray<Transaction>, Error>,
    potPayments: PaymentsHistoryState
  ) {
    return (
      <TransactionsList
        title={I18n.t("wallet.latestTransactions")}
        amount={I18n.t("wallet.amount")}
        transactions={potTransactions}
        helpMessage={potPayments.length > 0 ? this.helpMessage() : undefined}
        areMoreTransactionsAvailable={this.props.areMoreTransactionsAvailable}
        onLoadMoreTransactions={this.handleLoadMoreTransactions}
        navigateToTransactionDetails={
          this.props.navigateToTransactionDetailsScreen
        }
        readTransactions={this.props.readTransactions}
        ListEmptyComponent={this.listEmptyComponent(potPayments)}
      />
    );
  }

  private newMethodAddedContent = (
    <Content>
      <IconFont
        name={"io-close"}
        style={styles.end}
        onPress={this.handleBackPress}
      />
      <IconFont
        name={"io-complete"}
        size={120}
        color={customVariables.brandHighlight}
        style={styles.center}
      />
      <View spacer={true} />

      <Text alignCenter={true}>{`${I18n.t("global.genericThanks")},`}</Text>
      <Text alignCenter={true} bold={true}>
        {I18n.t("wallet.newPaymentMethod.successful")}
      </Text>
    </Content>
  );

  private footerButton(potWallets: pot.Pot<ReadonlyArray<Wallet>, Error>) {
    return (
      <ButtonDefaultOpacity
        block={true}
        onPress={
          pot.isSome(potWallets)
            ? this.props.navigateToPaymentScanQrCode
            : undefined
        }
        activeOpacity={1}
      >
        <IconFont name="io-qr" style={styles.white} />
        <Text>{I18n.t("wallet.payNotice")}</Text>
      </ButtonDefaultOpacity>
    );
  }

  public render(): React.ReactNode {
    const { potWallets, potTransactions, historyPayments } = this.props;

    const wallets = pot.getOrElse(potWallets, []);

    const hasNotSupportedWalletsOnly =
      wallets.length > 0 &&
      wallets.filter(wallet => wallet.type === TypeEnum.CREDIT_CARD).length ===
        0;

    const headerContent = pot.isLoading(potWallets)
      ? this.loadingWalletsHeader()
      : pot.isError(potWallets)
        ? this.errorWalletsHeader()
        : wallets.length > 0 && !hasNotSupportedWalletsOnly
          ? this.cardPreview(wallets)
          : this.withoutCardsHeader(hasNotSupportedWalletsOnly);

    const transactionContent = pot.isError(potTransactions)
      ? this.transactionError(historyPayments)
      : this.transactionList(potTransactions, historyPayments);

    const footerContent =
      pot.isSome(potWallets) && !this.newMethodAdded
        ? this.footerButton(potWallets)
        : undefined;

    const walletRefreshControl = (
      <RefreshControl
        onRefresh={() => {
          this.props.loadTransactions(this.props.transactionsLoadedLength);
          this.props.loadWallets();
        }}
        refreshing={false}
        tintColor={"transparent"} // iOS
      />
    );

    return (
      <WalletLayout
        title={I18n.t("wallet.wallet")}
        allowGoBack={false}
        appLogo={true}
        hasDynamicSubHeader={true}
        topContent={headerContent}
        footerContent={footerContent}
        refreshControl={walletRefreshControl}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet", "wallet_methods"]}
      >
        {this.newMethodAdded ? (
          this.newMethodAddedContent
        ) : (
          <React.Fragment>
            {/* Item displays only if the flag is enabled */}
            {this.props.isBonusEnabled && (
              <RequestBonus
                onButtonPress={() => this.props.navigateToRequestBonus()}
                bonus={this.props.currentActiveBonus}
                onBonusPress={this.props.navigateToBonusDetail}
              />
            )}
            {transactionContent}
          </React.Fragment>
        )}
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isPagoPaVersionSupported = fromNullable(state.backendInfo.serverInfo)
    .map(si => !isUpdateNeeded(si, "min_app_version_pagopa"))
    .getOrElse(true);

  return {
    isBonusEnabled: true,
    currentActiveBonus: pot.some(BONUS),
    potWallets: walletsSelector(state),
    historyPayments: paymentsHistorySelector(state),
    potTransactions: latestTransactionsSelector(state),
    transactionsLoadedLength: getTransactionsLoadedLength(state),
    areMoreTransactionsAvailable: areMoreTransactionsAvailable(state),
    isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
    readTransactions: transactionsReadSelector(state),
    nav: navSelector(state),
    isPagoPaVersionSupported
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletAddPaymentMethod: (keyFrom?: string) =>
    dispatch(navigateToWalletAddPaymentMethod({ inPayment: none, keyFrom })),
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
  navigateToBonusDetail: (bonus: any) => dispatch(navigateBack()),
  navigateToRequestBonus: () => dispatch(navigateBack()),
  navigateBack: (keyFrom?: string) => dispatch(navigateBack({ key: keyFrom })),
  loadTransactions: (start: number) =>
    dispatch(fetchTransactionsRequest({ start })),
  loadWallets: () => dispatch(fetchWalletsRequest())
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withLightModalContext(WalletHomeScreen))
  )
);

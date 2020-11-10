import { fromNullable, fromPredicate, none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, RefreshControl, StyleSheet } from "react-native";
import {
  NavigationEvents,
  NavigationEventSubscription,
  NavigationInjectedProps
} from "react-navigation";
import { connect } from "react-redux";
import { BonusActivationWithQrCode } from "../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import BoxedRefreshIndicator from "../../components/ui/BoxedRefreshIndicator";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { RotatedCards } from "../../components/wallet/card/RotatedCards";
import SectionCardComponent from "../../components/wallet/card/SectionCardComponent";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import { bonusVacanzeEnabled, bpdEnabled } from "../../config";
import RequestBonus from "../../features/bonus/bonusVacanze/components/RequestBonus";
import {
  navigateToAvailableBonusScreen,
  navigateToBonusActiveDetailScreen
} from "../../features/bonus/bonusVacanze/navigation/action";
import {
  loadAllBonusActivations,
  loadAvailableBonuses
} from "../../features/bonus/bonusVacanze/store/actions/bonusVacanze";
import { allBonusActiveSelector } from "../../features/bonus/bonusVacanze/store/reducers/allActive";
import { availableBonusTypesSelector } from "../../features/bonus/bonusVacanze/store/reducers/availableBonusesTypes";
import BpdCardsInWalletContainer from "../../features/bonus/bpd/components/walletCardContainer/BpdCardsInWalletComponent";
import I18n from "../../i18n";
import {
  navigateBack,
  navigateToPaymentScanQrCode,
  navigateToTransactionDetailsScreen,
  navigateToWalletAddPaymentMethod,
  navigateToWalletList,
  navigateToWalletTransactionsScreen
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  clearTransactions,
  fetchTransactionsLoadComplete,
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
  addDescription: {
    lineHeight: 24,
    fontSize: variables.fontSize1
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
    paddingBottom: variables.contentPadding / 2
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
    lineHeight: 18
  }
});

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

  private loadBonusVacanze = () => {
    if (bonusVacanzeEnabled) {
      this.props.loadAvailableBonuses();
      this.props.loadAllBonusActivations();
    }
  };

  public componentDidMount() {
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // https://www.pivotaltracker.com/story/show/168836972

    this.props.loadWallets();
    this.props.loadTransactions(this.props.transactionsLoadedLength);
    // eslint-disable-next-line functional/immutable-data
    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "light-content",
        customVariables.brandDarkGray
      );
    }); // eslint-disable-line
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    if (this.navListener) {
      this.navListener.remove();
    }
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentDidUpdate(prevProps: Readonly<Props>) {
    // check when all transactions are been loaded
    // then dispatch an action to notify the loading is completed
    if (
      prevProps.areMoreTransactionsAvailable &&
      !this.props.areMoreTransactionsAvailable &&
      pot.isSome(this.props.potTransactions)
    ) {
      this.props.dispatchAllTransactionLoaded(this.props.potTransactions.value);
    }
  }

  private cardHeader(isError: boolean = false, isBlue: boolean = false) {
    return (
      <SectionCardComponent
        label={I18n.t("wallet.paymentMethods")}
        onPress={() =>
          this.props.navigateToWalletAddPaymentMethod(
            getCurrentRouteKey(this.props.nav)
          )
        }
        isError={isError}
        cardStyle={
          isBlue ? { backgroundColor: customVariables.brandPrimary } : undefined
        }
      />
    );
  }

  private getCreditCards = () =>
    pot
      .getOrElse(this.props.potWallets, [])
      .filter(w => w.type === TypeEnum.CREDIT_CARD);

  private cardPreview() {
    const wallets = this.getCreditCards();
    // we have to render only wallets of credit card type
    const validWallets = wallets.filter(w => w.type === TypeEnum.CREDIT_CARD);
    const noMethod =
      validWallets.length === 0 && this.props.allActiveBonus.length === 0;
    return (
      <View>
        <View spacer={true} />
        {noMethod && (
          <React.Fragment>
            <Text white={true} style={styles.addDescription}>
              {I18n.t("wallet.newPaymentMethod.addDescription")}
            </Text>
            <View spacer={true} large={true} />
            <View spacer={true} small={true} />
          </React.Fragment>
        )}
        {this.cardHeader(false, noMethod)}

        {validWallets.length > 0 ? (
          <RotatedCards
            wallets={validWallets}
            onClick={this.props.navigateToWalletTransactionsScreen}
          />
        ) : null}
        {/* Display this item only if the flag is enabled */}

        {bonusVacanzeEnabled && (
          <RequestBonus
            onButtonPress={this.props.navigateToBonusList}
            activeBonuses={this.props.allActiveBonus}
            noMethod={noMethod}
            availableBonusesList={this.props.availableBonusesList}
            onBonusPress={this.props.navigateToBonusDetail}
          />
        )}
        {bpdEnabled && <BpdCardsInWalletContainer />}
      </View>
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
    const noMethod = this.props.allActiveBonus.length === 0;
    return (
      <View>
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
        {/* Display this item only if the flag is enabled */}
        {bonusVacanzeEnabled && (
          <RequestBonus
            onButtonPress={this.props.navigateToBonusList}
            activeBonuses={this.props.allActiveBonus}
            availableBonusesList={this.props.availableBonusesList}
            onBonusPress={this.props.navigateToBonusDetail}
            noMethod={noMethod}
          />
        )}
      </View>
    );
  }

  private renderHelpMessage = (
    alignCenter: boolean = false
  ): React.ReactNode => (
    <React.Fragment>
      <View spacer={true} large={true} />
      <Text style={alignCenter ? styles.centered : undefined}>
        {`${I18n.t("wallet.transactionHelpMessage.text1")} `}
        <Text style={alignCenter ? styles.centered : undefined} bold={true}>
          {I18n.t("wallet.transactionHelpMessage.text2")}
        </Text>
        {` ${I18n.t("wallet.transactionHelpMessage.text3")}`}
      </Text>
    </React.Fragment>
  );

  private transactionError() {
    return (
      <Content
        scrollEnabled={false}
        style={[styles.noBottomPadding, styles.whiteBg, styles.flex1]}
      >
        {this.renderHelpMessage()}
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
          {potPayments.length > 0 && this.renderHelpMessage(true)}
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
        helpMessage={
          potPayments.length > 0 ? this.renderHelpMessage() : undefined
        }
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

  // triggered on pull to refresh
  private handleOnRefresh = () => {
    this.loadBonusVacanze();
    this.props.refreshTransactions();
    this.props.loadWallets();
  };

  public render(): React.ReactNode {
    const { potWallets, potTransactions, historyPayments } = this.props;

    const headerContent = pot.isLoading(potWallets)
      ? this.loadingWalletsHeader()
      : pot.isError(potWallets)
      ? this.errorWalletsHeader()
      : this.cardPreview();

    const transactionContent = pot.isError(potTransactions)
      ? this.transactionError()
      : this.transactionList(potTransactions, historyPayments);

    const footerContent =
      pot.isSome(potWallets) && !this.newMethodAdded
        ? this.footerButton(potWallets)
        : undefined;

    const walletRefreshControl = (
      <RefreshControl
        onRefresh={this.handleOnRefresh}
        refreshing={false}
        tintColor={"transparent"} // iOS
      />
    );

    return (
      <WalletLayout
        accessibilityLabel={I18n.t("wallet.wallet")}
        title={I18n.t("wallet.wallet")}
        allowGoBack={false}
        appLogo={true}
        topContentHeight={this.getHeaderHeight()}
        hasDynamicSubHeader={true}
        topContent={headerContent}
        footerContent={footerContent}
        refreshControl={walletRefreshControl}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet", "wallet_methods"]}
        gradientHeader={true}
        headerPaddingMin={true}
      >
        {this.newMethodAdded ? this.newMethodAddedContent : transactionContent}
        {bonusVacanzeEnabled && (
          <NavigationEvents onWillFocus={this.loadBonusVacanze} />
        )}
      </WalletLayout>
    );
  }

  private getHeaderHeight() {
    return (
      250 +
      (bonusVacanzeEnabled ? this.props.allActiveBonus.length * 65 : 0) +
      this.getCreditCards().length * 56
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const isPagoPaVersionSupported = fromNullable(state.backendInfo.serverInfo)
    .map(si => !isUpdateNeeded(si, "min_app_version_pagopa"))
    .getOrElse(true);

  const potAvailableBonuses = availableBonusTypesSelector(state);
  return {
    allActiveBonus: allBonusActiveSelector(state),
    availableBonusesList: pot.getOrElse(potAvailableBonuses, []),
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
  navigateToWalletTransactionsScreen: (selectedWallet: Wallet) =>
    dispatch(navigateToWalletTransactionsScreen({ selectedWallet })),
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
  loadAvailableBonuses: () => dispatch(loadAvailableBonuses.request()),
  loadAllBonusActivations: () => dispatch(loadAllBonusActivations.request()),
  navigateToBonusDetail: (
    bonus: BonusActivationWithQrCode,
    validFrom?: Date,
    validTo?: Date
  ) =>
    dispatch(navigateToBonusActiveDetailScreen({ bonus, validFrom, validTo })),
  navigateToBonusList: () => dispatch(navigateToAvailableBonusScreen()),
  navigateBack: (keyFrom?: string) => dispatch(navigateBack({ key: keyFrom })),
  refreshTransactions: () => {
    dispatch(clearTransactions());
    dispatch(fetchTransactionsRequest({ start: 0 }));
  },
  loadTransactions: (start: number) =>
    dispatch(fetchTransactionsRequest({ start })),
  loadWallets: () => dispatch(fetchWalletsRequest()),
  dispatchAllTransactionLoaded: (transactions: ReadonlyArray<Transaction>) =>
    dispatch(fetchTransactionsLoadComplete(transactions))
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withLightModalContext(WalletHomeScreen))
  )
);

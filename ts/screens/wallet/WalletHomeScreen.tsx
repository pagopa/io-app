import { NavigationEvents } from "@react-navigation/compat";
import { none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { BonusActivationWithQrCode } from "../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { Body } from "../../components/core/typography/Body";
import { H3 } from "../../components/core/typography/H3";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import SectionCardComponent, {
  SectionCardStatus
} from "../../components/wallet/card/SectionCardComponent";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletHomeHeader from "../../components/wallet/WalletHomeHeader";
import WalletLayout from "../../components/wallet/WalletLayout";
import {
  bonusVacanzeEnabled,
  bpdEnabled,
  bpdOptInPaymentMethodsEnabled
} from "../../config";
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
import { supportedAvailableBonusSelector } from "../../features/bonus/bonusVacanze/store/reducers/availableBonusesTypes";
import BpdCardsInWalletContainer from "../../features/bonus/bpd/components/walletCardContainer/BpdCardsInWalletComponent";
import { bpdAllData } from "../../features/bonus/bpd/store/actions/details";
import { bpdPeriodsAmountWalletVisibleSelector } from "../../features/bonus/bpd/store/reducers/details/combiner";
import { bpdLastUpdateSelector } from "../../features/bonus/bpd/store/reducers/details/lastUpdate";
import CgnCardInWalletContainer from "../../features/bonus/cgn/components/CgnCardInWalletComponent";
import { cgnDetails } from "../../features/bonus/cgn/store/actions/details";
import {
  cgnDetailSelector,
  isCgnInformationAvailableSelector
} from "../../features/bonus/cgn/store/reducers/details";
import FeaturedCardCarousel from "../../features/wallet/component/card/FeaturedCardCarousel";
import WalletV2PreviewCards from "../../features/wallet/component/card/WalletV2PreviewCards";
import NewPaymentMethodAddedNotifier from "../../features/wallet/component/NewMethodAddedNotifier";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../navigation/params/MainTabParamsList";
import {
  navigateBack,
  navigateToPaymentScanQrCode,
  navigateToTransactionDetailsScreen,
  navigateToWalletAddPaymentMethod
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  fetchTransactionsLoadComplete,
  fetchTransactionsRequestWithExpBackoff,
  readTransaction
} from "../../store/actions/wallet/transactions";
import {
  fetchWalletsRequestWithExpBackoff,
  runSendAddCobadgeTrackSaga
} from "../../store/actions/wallet/wallets";
import {
  bpdRemoteConfigSelector,
  isCGNEnabledSelector
} from "../../store/reducers/backendStatus";
import { transactionsReadSelector } from "../../store/reducers/entities";
import { paymentsHistorySelector } from "../../store/reducers/payments/history";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { creditCardAttemptsSelector } from "../../store/reducers/wallet/creditCard";
import {
  areMoreTransactionsAvailable,
  getTransactionsLoadedLength,
  latestTransactionsSelector
} from "../../store/reducers/wallet/transactions";
import {
  bancomatListVisibleInWalletSelector,
  cobadgeListVisibleInWalletSelector,
  pagoPaCreditCardWalletV1Selector
} from "../../store/reducers/wallet/wallets";
import customVariables from "../../theme/variables";
import { Transaction, Wallet } from "../../types/pagopa";
import { isStrictSome } from "../../utils/pot";
import { showToast } from "../../utils/showToast";
import BpdOptInPaymentMethodsContainer from "../../features/bonus/bpd/components/optInPaymentMethods/BpdOptInPaymentMethodsContainer";

export type WalletHomeNavigationParams = Readonly<{
  newMethodAdded: boolean;
  keyFrom?: string;
}>;

type State = {
  hasFocus: boolean;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  IOStackNavigationRouteProps<MainTabParamsList, "WALLET_HOME"> &
  LightModalContextInterface;

const styles = StyleSheet.create({
  inLineSpace: {
    lineHeight: 20
  },
  addDescription: {
    lineHeight: 24,
    fontSize: customVariables.fontSize1
  },
  white: {
    color: customVariables.colorWhite
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
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingBottom: customVariables.contentPadding / 2
  },
  bordercColorBrandGray: {
    borderColor: customVariables.brandGray
  },
  colorBrandGray: {
    color: customVariables.brandGray
  },
  brandDarkGray: {
    color: customVariables.brandDarkGray
  },
  whiteBg: {
    backgroundColor: customVariables.colorWhite
  },
  noBottomPadding: {
    padding: customVariables.contentPadding,
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
class WalletHomeScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasFocus: false };
  }

  private handleBackPress = () => {
    const keyFrom = this.props.route.params?.keyFrom;
    const shouldPop =
      this.props.route.params?.newMethodAdded && keyFrom !== undefined;

    if (shouldPop) {
      this.props.navigateBack();
      return true;
    }
    return false;
  };

  private onFocus = () => {
    this.loadBonusVacanze();
    this.setState({ hasFocus: true });
  };

  private onLostFocus = () => {
    this.setState({ hasFocus: false });
  };

  private loadBonusVacanze = () => {
    if (bonusVacanzeEnabled) {
      this.props.loadAvailableBonuses();
      this.props.loadAllBonusActivations();
    }
  };

  private loadBonusBpd = () => {
    if (bpdEnabled) {
      this.props.loadBpdData();
    }
  };

  private loadBonusCgn = () => {
    if (this.props.isCgnEnabled) {
      this.props.loadCgnData();
    }
  };

  public componentDidMount() {
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // https://www.pivotaltracker.com/story/show/168836972

    if (pot.isNone(this.props.potWallets)) {
      this.props.loadWallets();
    }

    // To maintain retro compatibility, if the opt-in payment methods feature flag is turned off,
    // load the bonus information on Wallet mount
    if (
      !this.props.bpdConfig?.opt_in_payment_methods ||
      !bpdOptInPaymentMethodsEnabled
    ) {
      this.loadBonusBpd();
    }
    // FIXME restore loadTransactions see https://www.pivotaltracker.com/story/show/176051000

    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);

    // Dispatch the action associated to the saga responsible to remind a user
    // to add the co-badge card.
    // This cover the case in which a user update the app and don't refresh the wallet.
    this.props.runSendAddCobadgeMessageSaga();
  }

  public componentWillUnmount() {
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
    if (
      this.state.hasFocus &&
      // error loading: bpd bonus
      ((!pot.isError(prevProps.bpdLoadState) &&
        pot.isError(this.props.bpdLoadState)) ||
        // error loading: bonus vacanze
        (prevProps.allActiveBonus.some(ab => !pot.isError(ab)) &&
          this.props.allActiveBonus.some(ab => pot.isError(ab))) ||
        // error loading: wallet
        (!pot.isError(prevProps.potWallets) &&
          pot.isError(this.props.potWallets)))
    ) {
      showToast(I18n.t("wallet.errors.loadingData"));
    }

    // Dispatch the action associated to the saga responsible to remind a user
    // to add the co-badge card only if a new bancomat or a co-badge card was added
    const isBancomatListUpdated =
      pot.isSome(this.props.bancomatListVisibleInWallet) &&
      (!pot.isSome(prevProps.bancomatListVisibleInWallet) ||
        this.props.bancomatListVisibleInWallet.value.length !==
          prevProps.bancomatListVisibleInWallet.value.length);

    const isCobadgeListUpdated =
      pot.isSome(this.props.coBadgeListVisibleInWallet) &&
      (!pot.isSome(prevProps.coBadgeListVisibleInWallet) ||
        this.props.coBadgeListVisibleInWallet.value.length !==
          prevProps.coBadgeListVisibleInWallet.value.length);

    if (isBancomatListUpdated || isCobadgeListUpdated) {
      this.props.runSendAddCobadgeMessageSaga();
    }
  }

  private cardHeader(isError: boolean = false) {
    const sectionCardStatus: SectionCardStatus = pot.fold(
      this.props.potWallets,
      () => "show",
      () => "loading",
      _ => "loading",
      _ => "show",
      _ => "refresh",
      _ => "loading",
      _ => "loading",
      _ => "refresh"
    );
    return (
      <SectionCardComponent
        status={sectionCardStatus}
        accessibilityLabel={I18n.t("wallet.accessibility.sectionCardLabel")}
        accessibilityHint={I18n.t("wallet.accessibility.sectionCardHint")}
        label={I18n.t("wallet.paymentMethods")}
        onPress={() => {
          if (sectionCardStatus !== "loading") {
            this.props.loadWallets();
          }
        }}
        isError={isError}
      />
    );
  }

  private getCreditCards = () =>
    pot
      .getOrElse(this.props.potWallets, [])
      .filter(w => w.type === TypeEnum.CREDIT_CARD);

  private getBonusLoadingStatus = (): SectionCardStatus => {
    // if any bonus is loading or updating
    // note: in the BPD case, we are watching for loading on one of several steps
    // so this loading state is very weak
    if (
      pot.isLoading(this.props.bpdLoadState) ||
      this.props.allActiveBonus.find(
        ab => pot.isLoading(ab) || (pot.isNone(ab) && !pot.isError(ab))
      ) ||
      pot.isLoading(this.props.cgnDetails)
    ) {
      return "loading";
    }
    // if at least one bonus is some
    if (
      this.props.allActiveBonus.length === 0 ||
      this.props.allActiveBonus.every(ab => isStrictSome(ab)) ||
      pot.isSome(this.props.bpdLoadState)
    ) {
      return "refresh";
    }
    return "show";
  };

  private cardPreview() {
    const bonusLoadingStatus = this.getBonusLoadingStatus();
    return (
      <View>
        <View spacer={true} />
        {this.cardHeader(false)}

        {/* new payment methods rendering */}
        <WalletV2PreviewCards />

        {/* Display this item only if the flag is enabled */}
        {(bonusVacanzeEnabled || bpdEnabled) && (
          <RequestBonus
            status={bonusLoadingStatus}
            onButtonPress={() => {
              if (bonusLoadingStatus !== "loading") {
                this.loadBonusVacanze();
                this.loadBonusBpd();
                this.loadBonusCgn();
              }
            }}
            activeBonuses={this.props.allActiveBonus}
            availableBonusesList={this.props.availableBonusesList}
            onBonusPress={this.props.navigateToBonusDetail}
          />
        )}

        {/* When the opt_in_payment_methods FF is active hide the BpdCardsInWalletContainer component */}
        {!this.props.bpdConfig?.opt_in_payment_methods && bpdEnabled && (
          <BpdCardsInWalletContainer />
        )}
        <CgnCardInWalletContainer />
      </View>
    );
  }

  private renderHelpMessage = (
    alignCenter: boolean = false
  ): React.ReactNode => (
    <React.Fragment>
      <View spacer={true} large={true} />
      <Body style={alignCenter ? styles.centered : undefined}>
        {`${I18n.t("wallet.transactionHelpMessage.text1")} `}
        <Body
          weight={"SemiBold"}
          style={alignCenter ? styles.centered : undefined}
        >
          {I18n.t("wallet.transactionHelpMessage.text2")}
        </Body>
      </Body>
    </React.Fragment>
  );

  private transactionError(renderHelp: boolean) {
    return (
      <Content
        scrollEnabled={false}
        style={[styles.noBottomPadding, styles.whiteBg, styles.flex1]}
      >
        {renderHelp && this.renderHelpMessage()}
        <View spacer={true} large={true} />
        <H3 weight="SemiBold" color="bluegreyDark">
          {I18n.t("wallet.latestTransactions")}
        </H3>
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
          <Body color={"blue"}>{I18n.t("wallet.transactionsShow")}</Body>
        </ButtonDefaultOpacity>
        <EdgeBorderComponent />
        <View spacer={true} />
      </Content>
    );
  }

  private listEmptyComponent(renderHelpInfoBox: boolean) {
    return (
      <Content scrollEnabled={false} noPadded={true}>
        <View style={styles.emptyListWrapper}>
          {renderHelpInfoBox && this.renderHelpMessage(true)}
          <Body style={styles.emptyListContentTitle}>
            {I18n.t("wallet.noTransactionsInWalletHome")}
          </Body>
          <Image
            source={require("../../../img/messages/empty-transaction-list-icon.png")}
          />
        </View>
        <EdgeBorderComponent />
      </Content>
    );
  }

  private handleLoadMoreTransactions = () => {
    this.props.loadTransactions(this.props.transactionsLoadedLength);
  };

  private transactionList(
    potTransactions: pot.Pot<ReadonlyArray<Transaction>, Error>,
    renderHelpInfoBox: boolean
  ) {
    return (
      <TransactionsList
        title={I18n.t("wallet.latestTransactions")}
        amount={I18n.t("wallet.amount")}
        transactions={potTransactions}
        helpMessage={renderHelpInfoBox ? this.renderHelpMessage() : undefined}
        areMoreTransactionsAvailable={this.props.areMoreTransactionsAvailable}
        onLoadMoreTransactions={this.handleLoadMoreTransactions}
        navigateToTransactionDetails={
          this.props.navigateToTransactionDetailsScreen
        }
        readTransactions={this.props.readTransactions}
        ListEmptyComponent={this.listEmptyComponent(renderHelpInfoBox)}
      />
    );
  }

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
    const {
      potWallets,
      potTransactions,
      anyHistoryPayments,
      anyCreditCardAttempts
    } = this.props;

    const headerContent = (
      <>
        <WalletHomeHeader />
        {this.cardPreview()}
      </>
    );
    const transactionContent =
      pot.isError(potTransactions) ||
      (pot.isNone(potTransactions) &&
        !pot.isLoading(potTransactions) &&
        !pot.isUpdating(potTransactions))
        ? this.transactionError(anyHistoryPayments || anyCreditCardAttempts)
        : this.transactionList(
            potTransactions,
            anyHistoryPayments || anyCreditCardAttempts
          );

    const footerContent = pot.isSome(potWallets)
      ? this.footerButton(potWallets)
      : undefined;

    return (
      <WalletLayout
        accessibilityLabel={I18n.t("wallet.wallet")}
        title={I18n.t("wallet.wallet")}
        allowGoBack={false}
        appLogo={true}
        hideHeader={true}
        topContentHeight={this.getHeaderHeight()}
        hasDynamicSubHeader={false}
        topContent={headerContent}
        footerContent={footerContent}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet", "wallet_methods"]}
        gradientHeader={true}
        headerPaddingMin={true}
        footerFullWidth={<SectionStatusComponent sectionKey={"wallets"} />}
      >
        <BpdOptInPaymentMethodsContainer />
        <>
          {(bpdEnabled || this.props.isCgnEnabled) && <FeaturedCardCarousel />}
          {transactionContent}
        </>
        {bonusVacanzeEnabled && (
          <NavigationEvents
            onWillFocus={this.onFocus}
            onWillBlur={this.onLostFocus}
          />
        )}
        <NewPaymentMethodAddedNotifier />
      </WalletLayout>
    );
  }

  private getHeaderHeight() {
    return (
      250 +
      (bonusVacanzeEnabled ? this.props.allActiveBonus.length * 65 : 0) +
      (bpdEnabled
        ? pot.getOrElse(this.props.periodsWithAmount, []).length * 88
        : 0) +
      (this.props.isCgnEnabled && this.props.isCgnInfoAvailable ? 88 : 0) +
      this.getCreditCards().length * 56
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  periodsWithAmount: bpdPeriodsAmountWalletVisibleSelector(state),
  allActiveBonus: allBonusActiveSelector(state),
  availableBonusesList: supportedAvailableBonusSelector(state),
  // TODO: This selector (pagoPaCreditCardWalletV1Selector) should return the credit cards
  //  available for display in the wallet, so the cards added with the APP or with the WISP.
  //  But it leverage on the assumption that the meaning of pagoPA === true is the same of onboardingChannel !== "EXT"
  potWallets: pagoPaCreditCardWalletV1Selector(state),
  anyHistoryPayments: paymentsHistorySelector(state).length > 0,
  anyCreditCardAttempts: creditCardAttemptsSelector(state).length > 0,
  potTransactions: latestTransactionsSelector(state),
  transactionsLoadedLength: getTransactionsLoadedLength(state),
  areMoreTransactionsAvailable: areMoreTransactionsAvailable(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  readTransactions: transactionsReadSelector(state),
  bpdLoadState: bpdLastUpdateSelector(state),
  cgnDetails: cgnDetailSelector(state),
  isCgnInfoAvailable: isCgnInformationAvailableSelector(state),
  isCgnEnabled: isCGNEnabledSelector(state),
  bancomatListVisibleInWallet: bancomatListVisibleInWalletSelector(state),
  coBadgeListVisibleInWallet: cobadgeListVisibleInWalletSelector(state),
  bpdConfig: bpdRemoteConfigSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadBpdData: () => dispatch(bpdAllData.request()),
  loadCgnData: () => dispatch(cgnDetails.request()),
  navigateToWalletAddPaymentMethod: (keyFrom?: string) =>
    navigateToWalletAddPaymentMethod({ inPayment: none, keyFrom }),
  navigateToPaymentScanQrCode: () => navigateToPaymentScanQrCode(),
  navigateToTransactionDetailsScreen: (transaction: Transaction) => {
    dispatch(readTransaction(transaction));

    navigateToTransactionDetailsScreen({
      transaction,
      isPaymentCompletedTransaction: false
    });
  },
  loadAvailableBonuses: () => dispatch(loadAvailableBonuses.request()),
  loadAllBonusActivations: () => dispatch(loadAllBonusActivations.request()),
  navigateToBonusDetail: (
    bonus: BonusActivationWithQrCode,
    validFrom?: Date,
    validTo?: Date
  ) => navigateToBonusActiveDetailScreen({ bonus, validFrom, validTo }),
  navigateToBonusList: () => navigateToAvailableBonusScreen(),
  navigateBack: () => navigateBack(),
  loadTransactions: (start: number) =>
    dispatch(fetchTransactionsRequestWithExpBackoff({ start })),
  loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff()),
  dispatchAllTransactionLoaded: (transactions: ReadonlyArray<Transaction>) =>
    dispatch(fetchTransactionsLoadComplete(transactions)),
  runSendAddCobadgeMessageSaga: () => dispatch(runSendAddCobadgeTrackSaga())
});

export default withValidatedPagoPaVersion(
  withValidatedEmail(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withLightModalContext(WalletHomeScreen))
  )
);

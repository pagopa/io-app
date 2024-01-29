import { HSpacer, IOColors, Icon, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Content, Text as NBButtonText } from "native-base";
import * as React from "react";
import {
  BackHandler,
  Image,
  NativeEventSubscription,
  StyleSheet,
  View
} from "react-native";
import { connect } from "react-redux";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import SectionStatusComponent from "../../components/SectionStatus";
import { Body } from "../../components/core/typography/Body";
import { H3 } from "../../components/core/typography/H3";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import {
  TabBarItemPressType,
  withUseTabItemPressWhenScreenActive
} from "../../components/helpers/withUseTabItemPressWhenScreenActive";
import { withValidatedEmail } from "../../components/helpers/withValidatedEmail";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import { ScreenContentRoot } from "../../components/screens/ScreenContent";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import { TransactionsList } from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import SectionCardComponent, {
  SectionCardStatus
} from "../../components/wallet/card/SectionCardComponent";
import CgnCardInWalletContainer from "../../features/bonus/cgn/components/CgnCardInWalletComponent";
import { cgnDetails } from "../../features/bonus/cgn/store/actions/details";
import {
  cgnDetailSelector,
  isCgnInformationAvailableSelector
} from "../../features/bonus/cgn/store/reducers/details";
import { loadAvailableBonuses } from "../../features/bonus/common/store/actions/availableBonusesTypes";
import { supportedAvailableBonusSelector } from "../../features/bonus/common/store/selectors";
import IDPayCardsInWalletContainer from "../../features/idpay/wallet/components/IDPayCardsInWalletContainer";
import { idPayWalletGet } from "../../features/idpay/wallet/store/actions";
import { idPayWalletInitiativeListSelector } from "../../features/idpay/wallet/store/reducers";
import NewPaymentMethodAddedNotifier from "../../features/wallet/component/NewMethodAddedNotifier";
import FeaturedCardCarousel from "../../features/wallet/component/card/FeaturedCardCarousel";
import WalletV2PreviewCards from "../../features/wallet/component/card/WalletV2PreviewCards";
import { WalletBarcodeRoutes } from "../../features/walletV3/barcode/navigation/routes";
import { WalletTransactionRoutes } from "../../features/walletV3/transaction/navigation/navigator";
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
  fetchTransactionsRequestWithExpBackoff
} from "../../store/actions/wallet/transactions";
import {
  fetchWalletsRequestWithExpBackoff,
  runSendAddCobadgeTrackSaga
} from "../../store/actions/wallet/wallets";
import {
  isCGNEnabledSelector,
  isIdPayEnabledSelector
} from "../../store/reducers/backendStatus";
import { paymentsHistorySelector } from "../../store/reducers/payments/history";
import {
  isDesignSystemEnabledSelector,
  isPagoPATestEnabledSelector
} from "../../store/reducers/persistedPreferences";
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
import { showToast } from "../../utils/showToast";

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
  LightModalContextInterface &
  TabBarItemPressType;

const styles = StyleSheet.create({
  emptyListWrapper: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingBottom: customVariables.contentPadding / 2
  },
  whiteBg: {
    backgroundColor: IOColors.white
  },
  noBottomPadding: {
    padding: customVariables.contentPadding,
    paddingBottom: 0
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
  private subscription: NativeEventSubscription | undefined;
  private focusUnsubscribe!: () => void;
  private blurUnsubscribe!: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasFocus: false
    };
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
    this.props.loadAvailableBonuses();
    this.loadBonusIDPay();
    this.setState({ hasFocus: true });
  };

  private onLostFocus = () => {
    this.setState({ hasFocus: false });
  };

  private loadBonusCgn = () => {
    if (this.props.isCgnEnabled) {
      this.props.loadCgnData();
    }
  };

  private loadBonusIDPay = () => {
    if (this.props.isIdPayEnabled) {
      this.props.loadIdPayWalletData();
    }
  };

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.blurUnsubscribe = this.props.navigation.addListener(
      "blur",
      this.onLostFocus
    );
    // eslint-disable-next-line functional/immutable-data
    this.focusUnsubscribe = this.props.navigation.addListener(
      "focus",
      this.onFocus
    );
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // https://www.pivotaltracker.com/story/show/168836972

    this.props.loadWallets();

    // load the bonus information on Wallet mount
    // FIXME restore loadTransactions see https://www.pivotaltracker.com/story/show/176051000

    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );

    // Dispatch the action associated to the saga responsible to remind a user
    // to add the co-badge card.
    // This cover the case in which a user update the app and don't refresh the wallet.
    this.props.runSendAddCobadgeMessageSaga();
  }

  public componentWillUnmount() {
    this.subscription?.remove();
    this.focusUnsubscribe();
    this.blurUnsubscribe();
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
      !pot.isError(prevProps.potWallets) &&
      pot.isError(this.props.potWallets)
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
        testId={"walletPaymentMethodsTestId"}
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
    const isCgnLoading = pot.isLoading(this.props.cgnDetails);
    const isIdPayLoading = pot.isLoading(this.props.idPayDetails);
    const areBonusesLoading = isCgnLoading || isIdPayLoading;
    const areBonusesSome =
      pot.isSome(this.props.cgnDetails) || pot.isSome(this.props.idPayDetails);
    // if any bonus is loading or updating
    if (areBonusesLoading) {
      return "loading";
    }
    // if at least one bonus is some
    if (areBonusesSome) {
      return "refresh";
    }
    return "show";
  };

  private cardPreview() {
    const bonusLoadingStatus = this.getBonusLoadingStatus();
    const { isCgnEnabled, isIdPayEnabled } = this.props;
    return (
      <View>
        <VSpacer size={16} />
        {this.cardHeader(false)}
        {/* new payment methods rendering */}
        <WalletV2PreviewCards />
        <SectionCardComponent
          status={bonusLoadingStatus}
          accessibilityLabel={I18n.t("bonus.accessibility.sectionCardLabel")}
          accessibilityHint={I18n.t("bonus.accessibility.sectionCardHint")}
          label={I18n.t("bonus.requestLabel")}
          onPress={() => {
            if (bonusLoadingStatus !== "loading") {
              this.props.loadAvailableBonuses();
              if (isCgnEnabled) {
                this.loadBonusCgn();
              }
              if (isIdPayEnabled) {
                this.loadBonusIDPay();
              }
            }
          }}
        />
        {isCgnEnabled && <CgnCardInWalletContainer />}
        {isIdPayEnabled && <IDPayCardsInWalletContainer />}
      </View>
    );
  }

  private transactionError() {
    return (
      <Content
        scrollEnabled={false}
        style={[styles.noBottomPadding, styles.whiteBg, IOStyles.flex]}
      >
        <H3 weight="SemiBold" color="bluegreyDark">
          {I18n.t("wallet.latestTransactions")}
        </H3>
        <VSpacer size={16} />
        <ButtonDefaultOpacity
          block={true}
          light={true}
          bordered={true}
          small={true}
          onPress={() =>
            this.props.loadTransactions(this.props.transactionsLoadedLength)
          }
        >
          {/* ButtonText */}
          <Body color={"blue"}>{I18n.t("wallet.transactionsShow")}</Body>
        </ButtonDefaultOpacity>
        <EdgeBorderComponent />
        <VSpacer size={16} />
      </Content>
    );
  }

  private listEmptyComponent() {
    return (
      <Content scrollEnabled={false} noPadded={true}>
        <View style={styles.emptyListWrapper}>
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

  private navigateToWalletTransactionDetailsScreen = (
    transaction: Transaction
  ) => {
    if (this.props.isDesignSystemEnabled) {
      this.props.navigation.navigate(
        WalletTransactionRoutes.WALLET_TRANSACTION_MAIN,
        {
          screen: WalletTransactionRoutes.WALLET_TRANSACTION_DETAILS,
          params: {
            transactionId: transaction.id
          }
        }
      );
    } else {
      this.props.navigateToTransactionDetailsScreen(transaction);
    }
  };

  private transactionList(
    potTransactions: pot.Pot<ReadonlyArray<Transaction>, Error>
  ) {
    return (
      <TransactionsList
        title={I18n.t("wallet.latestTransactions")}
        transactions={potTransactions}
        areMoreTransactionsAvailable={this.props.areMoreTransactionsAvailable}
        onLoadMoreTransactions={this.handleLoadMoreTransactions}
        navigateToTransactionDetails={
          this.navigateToWalletTransactionDetailsScreen
        }
        ListEmptyComponent={this.listEmptyComponent()}
      />
    );
  }

  private navigateToPaymentScanQrCode = () => {
    if (this.props.isDesignSystemEnabled) {
      this.props.navigation.navigate(WalletBarcodeRoutes.WALLET_BARCODE_MAIN, {
        screen: WalletBarcodeRoutes.WALLET_BARCODE_SCAN
      });
    } else {
      this.props.navigateToPaymentScanQrCode();
    }
  };

  private footerButton(potWallets: pot.Pot<ReadonlyArray<Wallet>, Error>) {
    return (
      <ButtonDefaultOpacity
        block={true}
        onPress={
          pot.isSome(potWallets) ? this.navigateToPaymentScanQrCode : undefined
        }
        activeOpacity={1}
      >
        <Icon name="qrCode" color="white" size={24} />
        <HSpacer size={8} />
        <NBButtonText>{I18n.t("wallet.payNotice")}</NBButtonText>
      </ButtonDefaultOpacity>
    );
  }

  public render(): React.ReactNode {
    const { potWallets, potTransactions } = this.props;

    const headerContent = <>{this.cardPreview()}</>;
    const transactionContent =
      pot.isError(potTransactions) ||
      (pot.isNone(potTransactions) &&
        !pot.isLoading(potTransactions) &&
        !pot.isUpdating(potTransactions))
        ? this.transactionError()
        : this.transactionList(potTransactions);

    const footerContent = pot.isSome(potWallets)
      ? this.footerButton(potWallets)
      : undefined;

    return (
      <WalletLayout
        referenceToContentScreen={(c: ScreenContentRoot) => {
          this.props.setTabPressCallback(
            // eslint-disable-next-line no-underscore-dangle
            () => () => c._root.scrollToPosition(0, 0)
          );

          return c;
        }}
        accessibilityLabel={I18n.t("wallet.wallet")}
        title={I18n.t("wallet.wallet")}
        allowGoBack={false}
        appLogo={true}
        hideHeader={true}
        hideBaseHeader={true}
        topContentHeight={this.getHeaderHeight()}
        topContent={headerContent}
        footerContent={footerContent}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet", "wallet_methods"]}
        gradientHeader={true}
        headerPaddingMin={true}
        footerFullWidth={<SectionStatusComponent sectionKey={"wallets"} />}
      >
        <>
          {this.props.isCgnEnabled && <FeaturedCardCarousel />}
          {transactionContent}
        </>
        <NewPaymentMethodAddedNotifier />
      </WalletLayout>
    );
  }

  private getHeaderHeight() {
    return (
      250 +
      (this.props.isCgnEnabled && this.props.isCgnInfoAvailable ? 88 : 0) +
      this.getCreditCards().length * 56
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
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
  cgnDetails: cgnDetailSelector(state),
  idPayDetails: idPayWalletInitiativeListSelector(state),
  isCgnInfoAvailable: isCgnInformationAvailableSelector(state),
  isCgnEnabled: isCGNEnabledSelector(state),
  bancomatListVisibleInWallet: bancomatListVisibleInWalletSelector(state),
  coBadgeListVisibleInWallet: cobadgeListVisibleInWalletSelector(state),
  isDesignSystemEnabled: isDesignSystemEnabledSelector(state),
  isIdPayEnabled: isIdPayEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadCgnData: () => dispatch(cgnDetails.request()),
  loadIdPayWalletData: () => dispatch(idPayWalletGet.request()),
  navigateToWalletAddPaymentMethod: (keyFrom?: string) =>
    navigateToWalletAddPaymentMethod({ inPayment: O.none, keyFrom }),
  navigateToPaymentScanQrCode: () => navigateToPaymentScanQrCode(),
  navigateToTransactionDetailsScreen: (transaction: Transaction) => {
    navigateToTransactionDetailsScreen({
      transaction,
      isPaymentCompletedTransaction: false
    });
  },
  loadAvailableBonuses: () => dispatch(loadAvailableBonuses.request()),
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
    )(
      withUseTabItemPressWhenScreenActive(
        withLightModalContext(WalletHomeScreen)
      )
    )
  )
);

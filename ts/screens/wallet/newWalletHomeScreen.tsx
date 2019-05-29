/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View, Content } from "native-base";
import { Grid, Row } from "react-native-easy-grid";
import { none } from "fp-ts/lib/Option";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
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
import { Transaction } from "../../types/pagopa";
import variables from "../../theme/variables";
import { AddPaymentMethodButton } from '../../components/wallet/AddPaymentMethodButton';
import BoxedRefreshIndicator from '../../components/ui/BoxedRefreshIndicator';
import CardsFan from '../../components/wallet/card/CardsFan';
import H5 from '../../components/ui/H5';
import IconFont from '../../components/ui/IconFont'
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import TransactionsList from '../../components/wallet/TransactionsList';
import AnimatedScreenContent from '../../components/AnimatedScreenContent';
import { Wallet } from '../../../definitions/pagopa/Wallet';

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
      backgroundColor: variables.colorWhite,
    },

    noBottomPadding: {
      padding: variables.contentPadding,
      paddingBottom: 0
    },
  
    animatedSubHeaderContent: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      paddingHorizontal: variables.contentPadding
    },
});


/**
 * Wallet Home Screen
 */
class NewWalletHomeScreen extends React.Component<Props, never> {
  
  public componentDidMount() {
    // WIP loadTransactions should not be called from here
    // (transactions should be persisted & fetched periodically)
    // WIP WIP create pivotal story
    this.props.loadWallets();
    this.props.loadTransactions();
  }

  private cardsHeader() {
    return (
      <View style={styles.flexRow}>
          <View>
            <H5 style={styles.brandLightGray}>
              {I18n.t("wallet.paymentMethods")}
            </H5>
          </View>
          <View>
            <AddPaymentMethodButton
              onPress={this.props.navigateToWalletAddPaymentMethod}
            />
          </View>
      </View>
    );
  }

  private cardPreview(wallets: any) {
    return(
      <View>
        {this.cardsHeader()}
        <View spacer={true}/>
        <CardsFan
          wallets={
            wallets.length === 1 ? [wallets[0]] : [wallets[0], wallets[1]]
          }
          navigateToWalletList={this.props.navigateToWalletList}
        />
      </View>
      
    )
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
        {this.cardsHeader()}
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

  private fixedSubHeader() {
    return (
      <View style={styles.whiteBg}>
        <View spacer={true} />
        <View style={styles.animatedSubHeaderContent}>
          <H5 style={styles.brandDarkGray}>
            {I18n.t("wallet.latestTransactions")}
          </H5>
          <Text>{I18n.t("wallet.total")}</Text>
        </View>
        <View spacer={true} />
      </View>
    );
  }

  private transactionError() {
    return(
      <Content
        scrollEnabled={false}
        style={[styles.noBottomPadding, styles.whiteBg, styles.flex1]}
      >
        <View spacer={true} />
        <H5 style={styles.brandDarkGray}>
          {I18n.t("wallet.transactions")}
        </H5>
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
    )
  };

  private ListEmptyComponent(){
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
    )
  }; 
    
  private transactionList( potTransactions: pot.Pot<ReadonlyArray<Transaction>, Error>  ) {
    return(
      <TransactionsList
        title={I18n.t("wallet.latestTransactions")}
        totalAmount={I18n.t("wallet.total")}
        transactions={potTransactions}
        navigateToTransactionDetails={
          this.props.navigateToTransactionDetailsScreen
        }
        ListEmptyComponent={this.ListEmptyComponent}
      />
    )
  };

  // TODO: insert a more detailed value for appheader height
  private animatedViewHeight: number = variables.h5LineHeight + 2 * variables.spacerWidth; //
  // TODO: insert a more detailed value for topContentHeight
  private topContentHeight: number = 450;
  private topContentHeightOffset: number = 40;
  private interpolationVars: ReadonlyArray<number> = [
    this.animatedViewHeight,
    this.topContentHeight,
    this.topContentHeightOffset
  ];

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
    
    const transactionContent = pot.isError(potTransactions) ? (
      this.transactionError()
    ) : (
      this.transactionList(potTransactions)
    );
    
    return (
      <TopScreenComponent
        goBack={false}
        title={I18n.t("wallet.wallet")}
        dark={true}
        headerBody={
          <Image
            style={{ resizeMode: "contain", width: 60 }}
            source={require("../../../img/wallet/logo-pagopa-test.png")} //TODO: insert here the new pagopalogo component not Image
          />
        }
      >
        <AnimatedScreenContent
          title={I18n.t("wallet.wallet")}
          icon={require("../../../img/wallet/bank.png")}
          dark={true}
          fixedSubHeader={this.fixedSubHeader()} //TODO: evaluate what can be included directly into the component
          headerContentHeight={1}
          interpolationVars={this.interpolationVars} //TODO: make it dynamic with header extent
        >

          <View style={{backgroundColor: variables.brandDarkGray, paddingHorizontal: variables.contentPadding}}>
            <View spacer={true}/>
            {headerContent}
          </View>
          {transactionContent}
        </AnimatedScreenContent>

        {/** TODO: make it being alwais be at bottom -- flexgrow to animatedscrollview */}  
        <View footer={true}>
            <Button block={true} 
              onPress={pot.isSome(potWallets)
              ? this.props.navigateToPaymentScanQrCode
              : undefined}>
              <IconFont name="io-qr" style={{ color: variables.colorWhite }} />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>

      </TopScreenComponent>
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
)(NewWalletHomeScreen);

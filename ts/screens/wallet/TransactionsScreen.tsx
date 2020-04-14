/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import H5 from "../../components/ui/H5";
import CardComponent from "../../components/wallet/card/CardComponent";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import {
  navigateToTransactionDetailsScreen,
  navigateToWalletHome,
  navigateToWalletList
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  fetchTransactionsRequest,
  readTransaction
} from "../../store/actions/wallet/transactions";
import {
  deleteWalletRequest,
  setFavouriteWalletRequest
} from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import { getWalletTransactionsCreator } from "../../store/reducers/wallet/transactions";
import { getFavoriteWalletId } from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Transaction, Wallet } from "../../types/pagopa";
import { showToast } from "../../utils/showToast";

type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  walletBannerText: {
    alignItems: "flex-end",
    flexDirection: "row"
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.walletCardTransaction.contextualHelpTitle",
  body: "wallet.walletCardTransaction.contextualHelpContent"
};

const ListEmptyComponent = (
  <Content
    scrollEnabled={false}
    style={[styles.noBottomPadding, styles.whiteBg]}
  >
    <H5 style={styles.brandDarkGray}>{I18n.t("wallet.noneTransactions")}</H5>
    <View spacer={true} />
    <Text>{I18n.t("wallet.noTransactionsInTransactionsScreen")}</Text>
    <View spacer={true} large={true} />
  </Content>
);

class TransactionsScreen extends React.Component<Props> {
  private headerContent(
    selectedWallet: Wallet,
    isFavorite: pot.Pot<boolean, string>
  ) {
    return (
      <React.Fragment>
        <View>
          <View spacer={true} large={true} />
          <View style={styles.walletBannerText}>
            <Text white={true}>{I18n.t("wallet.creditDebitCards")}</Text>
          </View>
        </View>

        <CardComponent
          type={"Header"}
          wallet={selectedWallet}
          hideFavoriteIcon={false}
          hideMenu={false}
          isFavorite={isFavorite}
          onSetFavorite={(willBeFavorite: boolean) =>
            this.props.setFavoriteWallet(
              willBeFavorite ? selectedWallet.idWallet : undefined
            )
          }
          onDelete={() => this.props.deleteWallet(selectedWallet.idWallet)}
        />
      </React.Fragment>
    );
  }

  public render(): React.ReactNode {
    const selectedWallet = this.props.navigation.getParam("selectedWallet");

    const isFavorite = pot.map(
      this.props.favoriteWallet,
      _ => _ === selectedWallet.idWallet
    );

    const transactionsRefreshControl = (
      <RefreshControl
        onRefresh={() => {
          this.props.loadTransactions();
        }}
        // The refresh control spinner is displayed only at pull-to-refresh
        // while, during the transactions reload, it is displayed the custom transaction
        // list spinner
        refreshing={false}
        tintColor={"transparent"}
      />
    );

    return (
      <WalletLayout
        title={I18n.t("wallet.paymentMethod")}
        allowGoBack={true}
        topContent={this.headerContent(selectedWallet, isFavorite)}
        hideHeader={true}
        hasDynamicSubHeader={true}
        refreshControl={transactionsRefreshControl}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_transaction"]}
      >
        <TransactionsList
          title={I18n.t("wallet.transactions")}
          amount={I18n.t("wallet.amount")}
          transactions={this.props.transactions}
          navigateToTransactionDetails={
            this.props.navigateToTransactionDetailsScreen
          }
          readTransactions={this.props.readTransactions}
          ListEmptyComponent={ListEmptyComponent}
        />
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
  transactions: getWalletTransactionsCreator(
    ownProps.navigation.getParam("selectedWallet").idWallet
  )(state),
  favoriteWallet: getFavoriteWalletId(state),
  readTransactions: state.entities.transactionsRead
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadTransactions: () => dispatch(fetchTransactionsRequest()),
  navigateToTransactionDetailsScreen: (transaction: Transaction) => {
    dispatch(readTransaction(transaction));
    dispatch(
      navigateToTransactionDetailsScreen({
        transaction,
        isPaymentCompletedTransaction: false
      })
    );
  },
  setFavoriteWallet: (walletId?: number) =>
    dispatch(setFavouriteWalletRequest(walletId)),
  deleteWallet: (walletId: number) =>
    dispatch(
      deleteWalletRequest({
        walletId,
        onSuccess: action => {
          showToast(I18n.t("wallet.delete.successful"), "success");
          if (action.payload.length > 0) {
            dispatch(navigateToWalletList());
          } else {
            dispatch(navigateToWalletHome());
          }
        },
        onFailure: _ => {
          showToast(I18n.t("wallet.delete.failed"), "danger");
        }
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsScreen);

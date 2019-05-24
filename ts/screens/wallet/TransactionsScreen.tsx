/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, H3, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

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
    height: 50,
    alignItems: "flex-end",
    flexDirection: "row"
  },
  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },
  whiteContent: {
    backgroundColor: variables.colorWhite,
    flex: 1
  }
});

const ListEmptyComponent = (
  <Content
    scrollEnabled={false}
    style={[styles.noBottomPadding, styles.whiteContent]}
  >
    <View spacer={true} />
    <H3>{I18n.t("wallet.noneTransactions")}</H3>
    <View spacer={true} />
    <Text>{I18n.t("wallet.noTransactionsInTransactionsScreen")}</Text>
    <View spacer={true} large={true} />
  </Content>
);

class TransactionsScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    const selectedWallet = this.props.navigation.getParam("selectedWallet");
    const isFavorite = pot.map(
      this.props.favoriteWallet,
      _ => _ === selectedWallet.idWallet
    );
    const headerContents = (
      <View>
        <View style={styles.walletBannerText}>
          <Text white={true}>{I18n.t("wallet.creditDebitCards")}</Text>
        </View>
        <View spacer={true} />
      </View>
    );

    return (
      <WalletLayout
        title={I18n.t("wallet.paymentMethod")}
        allowGoBack={true}
        headerContents={headerContents}
        displayedWallets={
          <CardComponent
            type="Header"
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
        }
      >
        <TransactionsList
          title={I18n.t("wallet.transactions")}
          totalAmount={I18n.t("wallet.total")}
          transactions={this.props.transactions}
          navigateToTransactionDetails={
            this.props.navigateToTransactionDetailsScreen
          }
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
  favoriteWallet: getFavoriteWalletId(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToTransactionDetailsScreen: (transaction: Transaction) =>
    dispatch(
      navigateToTransactionDetailsScreen({
        transaction,
        isPaymentCompletedTransaction: false
      })
    ),
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

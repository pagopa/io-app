/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

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

  flex1: {
    flex: 1
  },

  whiteBg: {
    backgroundColor: variables.colorWhite,
    
  },

  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: variables.contentPadding,
    backgroundColor: variables.colorWhite
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  }
});

const ListEmptyComponent = (
  <Content
    scrollEnabled={false}
    style={[styles.noBottomPadding, styles.whiteBg]}
  >
    <View spacer={true} />
    <H5>{I18n.t("wallet.noneTransactions")}</H5>
    <View spacer={true} />
    <Text>{I18n.t("wallet.noTransactionsInTransactionsScreen")}</Text>
    <View spacer={true} large={true} />
  </Content>
);

class TransactionsScreen extends React.Component<Props> {
  private headerContent(
    selectedWallet: Wallet,
    isFavorite: pot.Pot<boolean, Error>
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
      </React.Fragment>
    );
  }

  private fixedSubHeader() {
    return (
      <View style={[styles.whiteBg, styles.flex1]}>
        <View spacer={true} />
        <View style={styles.subHeaderContent}>
          <H5 style={styles.brandDarkGray}>
            {I18n.t("wallet.latestTransactions")}
          </H5>
          <Text>{I18n.t("wallet.total")}</Text>
        </View>
        <View spacer={true} />
      </View>
    );
  }

  private animatedViewHeight: number =
    variables.h5LineHeight + 2 * variables.spacerWidth;
  private topContentHeight: number = 250;
  private topContentHeightOffset: number = 40;
  private interpolationVars: ReadonlyArray<number> = [
    this.animatedViewHeight,
    this.topContentHeight,
    this.topContentHeightOffset
  ];

  public render(): React.ReactNode {
    const selectedWallet = this.props.navigation.getParam("selectedWallet");

    const isFavorite = pot.map(
      this.props.favoriteWallet,
      _ => _ === selectedWallet.idWallet
    );

    return (
      <WalletLayout
        title={I18n.t("wallet.paymentMethod")}
        allowGoBack={true}
        topContent={this.headerContent(selectedWallet, isFavorite)}
        hideHeader={true}
        fixedSubHeader={this.fixedSubHeader()}
        interpolationVars={this.interpolationVars}
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

/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View, Button } from "native-base";
import * as React from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";

import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import H5 from "../../components/ui/H5";
import CardComponent from "../../components/wallet/card/CardComponent";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import PaymentMethodCapabilities from "../../features/wallet/component/PaymentMethodCapabilities";
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
import { paymentsHistorySelector } from "../../store/reducers/payments/history";
import { GlobalState } from "../../store/reducers/types";
import {
  areMoreTransactionsAvailable,
  getTransactions,
  getTransactionsLoadedLength
} from "../../store/reducers/wallet/transactions";
import {
  getFavoriteWalletId,
  paymentMethodsSelector
} from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Transaction, Wallet } from "../../types/pagopa";
import { showToast } from "../../utils/showToast";
import { handleSetFavourite } from "../../utils/wallet";
import { IOColors } from "../../components/core/variables/IOColors";
import { Label } from "../../components/core/typography/Label";

import amex from "../../../img/wallet/cards-icons/form/amex.png";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { useRemovePaymentMethodBottomSheet } from "../../features/wallet/component/RemovePaymentMethod";

type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  Readonly<{ isLoading: boolean; loadingCaption?: string | undefined; loadingOpacity?: number | undefined; onCancel?: any }>;
  
const styles = StyleSheet.create({
  walletBannerText: {
    alignItems: "flex-end",
    flexDirection: "row"
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 30
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  },

  cardContainer: {
    height: 235,
    width: "100%",
    position: "absolute",
    top: 16,
    zIndex: 7,
    elevation: 7,
    alignItems: "center"
  },
  headerSpacer: {
    height: 172
  },
  cancelButton: {
    borderColor: IOColors.red,
    width: '90%',
    height: variables.btnHeight + 10,
    marginHorizontal: variables.contentPadding,
    marginTop: 16,
  }
});


const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.walletCardTransaction.contextualHelpTitle",
  body: "wallet.walletCardTransaction.contextualHelpContent"
};

const UnsubscribeButton = (props: { onPress?: () => void }) => (
  <Button bordered={true} style={styles.cancelButton} onPress={props.onPress}>
    <Label color={"red"}>{I18n.t("wallet.bancomat.details.removeCta")}</Label>
  </Button>
);

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

const HEADER_HEIGHT = 250;

const TransactionsScreen: React.FunctionComponent<Props> = (props: Props) => {
  const headerContent = (
    selectedWallet: Wallet,
    isFavorite: pot.Pot<boolean, Error>
  ) => (
      <React.Fragment>
        <CardComponent
          type={"Header"}
          wallet={selectedWallet}
          hideFavoriteIcon={false}
          hideMenu={false}
          isFavorite={isFavorite}
          onSetFavorite={(willBeFavorite: boolean) =>
            handleSetFavourite(willBeFavorite, () =>
              props.setFavoriteWallet(selectedWallet.idWallet)
            )
          }
          onDelete={() => props.deleteWallet(selectedWallet.idWallet)}
        />
      </React.Fragment>
    );


  const handleLoadMoreTransactions = () => {
    props.loadTransactions(props.transactionsLoadedLength);
  };

  const selectedWallet = props.navigation.getParam("selectedWallet");

  const transactions = pot.map(props.transactions, tsx =>
    tsx
      .filter(t => t.idWallet === selectedWallet.idWallet)
      .sort((a, b) => b.created.getTime() - a.created.getTime())
  );

  const isFavorite = pot.map(
    props.favoriteWallet,
    _ => _ === selectedWallet.idWallet
  );

  // to retro-compatibility purpose
  const pm = pot.getOrElse(
    pot.map(props.paymentMethods, pms =>
      pms.find(pm => pm.idWallet === selectedWallet.idWallet)
    ),
    undefined
  );

  const transactionsRefreshControl = (
    <RefreshControl
      onRefresh={() => {
        props.loadTransactions(props.transactionsLoadedLength);
      }}
      // The refresh control spinner is displayed only at pull-to-refresh
      // while, during the transactions reload, it is displayed the custom transaction
      // list spinner
      refreshing={false}
      tintColor={"transparent"}
    />
  );

  const { present } = useRemovePaymentMethodBottomSheet({
    icon: amex,
    caption: I18n.t("wallet.methods.card.name")
  });


  return (
    <WalletLayout
      title={I18n.t("wallet.paymentMethod")}
      allowGoBack={true}
      topContent={headerContent(selectedWallet, isFavorite)}
      hideHeader={true}
      hasDynamicSubHeader={true}
      topContentHeight={HEADER_HEIGHT}
      refreshControl={transactionsRefreshControl}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["wallet_transaction"]}
    >
      {pm && (
        <View style={IOStyles.horizontalContentPadding}>
          <View spacer={true} extralarge={true} />
          <PaymentMethodCapabilities paymentMethod={pm} />
          <View spacer={true} />
          <ItemSeparatorComponent noPadded={true} />
        </View>
      )}
      <TransactionsList
        title={I18n.t("wallet.transactions")}
        amount={I18n.t("wallet.amount")}
        transactions={transactions}
        areMoreTransactionsAvailable={props.areMoreTransactionsAvailable}
        onLoadMoreTransactions={handleLoadMoreTransactions}
        navigateToTransactionDetails={
          props.navigateToTransactionDetailsScreen
        }
        readTransactions={props.readTransactions}
        ListEmptyComponent={ListEmptyComponent}
      />
      <UnsubscribeButton
        onPress={() => present(() => props.deleteWallet(selectedWallet.idWallet))}
      />
      <EdgeBorderComponent />
    </WalletLayout>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  transactions: getTransactions(state),
  potPayments: paymentsHistorySelector(state),
  transactionsLoadedLength: getTransactionsLoadedLength(state),
  favoriteWallet: getFavoriteWalletId(state),
  readTransactions: state.entities.transactionsRead,
  areMoreTransactionsAvailable: areMoreTransactionsAvailable(state),
  paymentMethods: paymentMethodsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadTransactions: (start: number) =>
    dispatch(fetchTransactionsRequest({ start })),
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
)(withLoadingSpinner(TransactionsScreen));

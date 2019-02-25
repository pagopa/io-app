/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import { Text, View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { WalletStyles } from "../../components/styles/wallet";
import CardComponent from "../../components/wallet/card/CardComponent";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import { navigateToTransactionDetailsScreen } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import { getWalletTransactionsCreator } from "../../store/reducers/wallet/transactions";
import { Transaction, Wallet } from "../../types/pagopa";

type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

class TransactionsScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    const selectedWallet = this.props.navigation.getParam("selectedWallet");
    const headerContents = (
      <View>
        <View style={WalletStyles.walletBannerText}>
          <Text style={WalletStyles.white}>
            {I18n.t("wallet.creditDebitCards")}
          </Text>
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
            hideFavoriteIcon={true}
            hideMenu={true}
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
          noTransactionsDetailsMessage={I18n.t(
            "wallet.noTransactionsDetailsWalletSpecific"
          )}
        />
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
  transactions: getWalletTransactionsCreator(
    ownProps.navigation.getParam("selectedWallet").idWallet
  )(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToTransactionDetailsScreen: (transaction: Transaction) =>
    dispatch(
      navigateToTransactionDetailsScreen({
        transaction,
        isPaymentCompletedTransaction: false
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsScreen);

/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as React from "react";
import I18n from "../../i18n";

import { Text, View } from "native-base";
import { NavigationInjectedProps } from "react-navigation";

import { connect } from "react-redux";
import { WalletStyles } from "../../components/styles/wallet";
import CardFull from "../../components/wallet/card/CardFull";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import ROUTES from "../../navigation/routes";
import {
  navigateToTransactionDetailsScreen,
  navigateToWalletTransactionsScreen
} from "../../store/actions/navigation";
import { GlobalState } from "../../store/reducers/types";
import { getTransactions } from "../../store/reducers/wallet/transactions";
import { getFavoriteWalletId } from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";

type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type ReduxMappedProps = Readonly<{
  favoriteWalletId?: number;
  transactions: ReturnType<typeof getTransactions>;
}>;

type Props = ReduxMappedProps & NavigationInjectedProps<NavigationParams>;

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
        showPayButton={false}
        allowGoBack={true}
        headerContents={headerContents}
        displayedWallets={
          <CardFull
            wallet={selectedWallet}
            favoriteWalletId={this.props.favoriteWalletId}
            navigateToWalletTransactions={(wallet: Wallet) =>
              this.props.navigation.dispatch(
                navigateToWalletTransactionsScreen({ selectedWallet: wallet })
              )
            }
          />
        }
        navigateToScanQrCode={() =>
          this.props.navigation.navigate(ROUTES.PAYMENT_SCAN_QR_CODE)
        }
      >
        <TransactionsList
          title={I18n.t("wallet.transactions")}
          totalAmount={I18n.t("wallet.total")}
          transactions={this.props.transactions}
          navigateToTransactionDetails={transaction =>
            this.props.navigation.dispatch(
              navigateToTransactionDetailsScreen({
                transaction,
                isPaymentCompletedTransaction: false
              })
            )
          }
        />
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  favoriteWalletId: getFavoriteWalletId(state).toUndefined(),
  transactions: getTransactions(state)
});

export default connect(mapStateToProps)(TransactionsScreen);

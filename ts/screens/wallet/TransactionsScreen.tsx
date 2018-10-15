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
import TransactionsList from "../../components/wallet/TransactionsList";
import { CardEnum } from "../../components/wallet/WalletLayout";
import WalletLayout from "../../components/wallet/WalletLayout";
import ROUTES from "../../navigation/routes";
import {
  navigateToTransactionDetailsScreen,
  navigateToWalletTransactionsScreen
} from "../../store/actions/navigation";
import { GlobalState } from "../../store/reducers/types";
import { getTransactions } from "../../store/reducers/wallet/transactions";
import { Wallet } from "../../types/pagopa";

type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type ReduxMappedProps = Readonly<{
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
        cardType={{ type: CardEnum.FULL, card: selectedWallet }}
        navigateToWalletList={() =>
          this.props.navigation.navigate(ROUTES.WALLET_LIST)
        }
        navigateToScanQrCode={() =>
          this.props.navigation.navigate(ROUTES.PAYMENT_SCAN_QR_CODE)
        }
        navigateToWalletTransactions={(wallet: Wallet) =>
          this.props.navigation.dispatch(
            navigateToWalletTransactionsScreen({ selectedWallet: wallet })
          )
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
  transactions: getTransactions(state)
});

export default connect(mapStateToProps)(TransactionsScreen);

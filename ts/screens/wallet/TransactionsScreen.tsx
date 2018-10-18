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
import {
  navigateToPaymentScanQrCode,
  navigateToTransactionDetailsScreen
} from "../../store/actions/navigation";
import { GlobalState } from "../../store/reducers/types";
import { getWalletTransactionsCreator } from "../../store/reducers/wallet/transactions";
import { getFavoriteWalletId } from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";

type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type ReduxMappedProps = Readonly<{
  favoriteWalletId?: number;
  transactions: ReturnType<ReturnType<typeof getWalletTransactionsCreator>>;
}>;

type Props = OwnProps & ReduxMappedProps;

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
          <CardComponent
            type="Header"
            wallet={selectedWallet}
            hideFavoriteIcon={true}
          />
        }
        navigateToScanQrCode={() =>
          this.props.navigation.dispatch(navigateToPaymentScanQrCode())
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

const mapStateToProps = (
  state: GlobalState,
  ownProps: OwnProps
): ReduxMappedProps => ({
  favoriteWalletId: getFavoriteWalletId(state).toUndefined(),
  transactions: getWalletTransactionsCreator(
    ownProps.navigation.getParam("selectedWallet").idWallet
  )(state)
});

export default connect(mapStateToProps)(TransactionsScreen);

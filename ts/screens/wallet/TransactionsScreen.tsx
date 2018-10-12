/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as React from "react";
import I18n from "../../i18n";

import { Text, View } from "native-base";
import { NavigationInjectedProps } from "react-navigation";

import { connect } from "react-redux";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { WalletStyles } from "../../components/styles/wallet";
import TransactionsList, {
  TransactionsDisplayed
} from "../../components/wallet/TransactionsList";
import { CardEnum } from "../../components/wallet/WalletLayout";
import WalletLayout from "../../components/wallet/WalletLayout";
import ROUTES from "../../navigation/routes";
import { navigateToTransactionDetailsScreen } from "../../store/actions/navigation";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import { selectedWalletSelector } from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";
import { UNKNOWN_CARD } from "../../types/unknown";

type NavigationParams = Readonly<{
  paymentCompleted: boolean;
  card: Wallet;
}>;

type ReduxMappedProps = Readonly<{
  selectedWallet: Wallet;
  isLoading: boolean;
}>;

type Props = ReduxMappedProps & NavigationInjectedProps<NavigationParams>;

class TransactionsScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
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
        headerContents={headerContents}
        cardType={{ type: CardEnum.FULL, card: this.props.selectedWallet }}
        navigateToWalletList={() =>
          this.props.navigation.navigate(ROUTES.WALLET_LIST)
        }
        navigateToScanQrCode={() =>
          this.props.navigation.navigate(ROUTES.PAYMENT_SCAN_QR_CODE)
        }
        navigateToCardTransactions={() =>
          this.props.navigation.navigate(ROUTES.WALLET_CARD_TRANSACTIONS)
        }
      >
        <TransactionsList
          title={I18n.t("wallet.transactions")}
          totalAmount={I18n.t("wallet.total")}
          display={TransactionsDisplayed.BY_WALLET}
          navigateToTransactionDetails={() =>
            this.props.navigation.dispatch(
              navigateToTransactionDetailsScreen({
                paymentCompleted: false
              })
            )
          }
        />
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  selectedWallet: selectedWalletSelector(state).getOrElse(UNKNOWN_CARD),
  isLoading: createLoadingSelector(["WALLET_MANAGEMENT_LOAD"])(state)
});

export default connect(mapStateToProps)(
  withLoadingSpinner(TransactionsScreen, {})
);

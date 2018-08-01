/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as React from "react";
import I18n from "../../i18n";

import { Text, View } from "native-base";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { connect } from "react-redux";
import { WalletStyles } from "../../components/styles/wallet";
import TransactionsList, {
  TransactionsDisplayed
} from "../../components/wallet/TransactionsList";
import { CardEnum } from "../../components/wallet/WalletLayout";
import WalletLayout from "../../components/wallet/WalletLayout";
import { GlobalState } from "../../store/reducers/types";
import { selectedWalletSelector } from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";
import { UNKNOWN_CARD } from "../../types/unknown";

interface ParamType {
  readonly card: Wallet;
}

interface StateParams extends NavigationState {
  readonly params: ParamType;
}

interface OwnProps {
  readonly navigation: NavigationScreenProp<StateParams>;
}

type ReduxMappedProps = Readonly<{
  selectedWallet: Wallet;
}>;

type Props = ReduxMappedProps & OwnProps & NavigationInjectedProps;

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
        navigation={this.props.navigation}
        showPayButton={false}
        headerContents={headerContents}
        cardType={{ type: CardEnum.FULL, card: this.props.selectedWallet }}
      >
        <TransactionsList
          title={I18n.t("wallet.transactions")}
          totalAmount={I18n.t("wallet.total")}
          navigation={this.props.navigation}
          display={TransactionsDisplayed.BY_WALLET}
        />
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  selectedWallet: selectedWalletSelector(state).getOrElse(UNKNOWN_CARD)
});
export default connect(mapStateToProps)(TransactionsScreen);

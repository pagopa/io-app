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
import { Wallet } from "../../../definitions/pagopa/Wallet";
import { WalletStyles } from "../../components/styles/wallet";
import TransactionsList, {
  TransactionsDisplayed
} from "../../components/wallet/TransactionsList";
import { CardEnum } from "../../components/wallet/WalletLayout";
import WalletLayout from "../../components/wallet/WalletLayout";
import { GlobalState } from "../../store/reducers/types";
import { selectedCreditCardSelector } from "../../store/reducers/wallet/cards";
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
  selectedCard: Wallet;
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
        cardType={{ type: CardEnum.FULL, card: this.props.selectedCard }}
      >
        <TransactionsList
          title={I18n.t("wallet.transactions")}
          totalAmount={I18n.t("wallet.total")}
          navigation={this.props.navigation}
          display={TransactionsDisplayed.BY_CARD}
        />
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  selectedCard: selectedCreditCardSelector(state).getOrElse(UNKNOWN_CARD)
});
export default connect(mapStateToProps)(TransactionsScreen);

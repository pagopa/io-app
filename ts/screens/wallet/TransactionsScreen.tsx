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

import { WalletStyles } from "../../components/styles/wallet";
import TransactionsList, {
  TransactionsDisplayed
} from "../../components/wallet/TransactionsList";
import { CardType, WalletLayout } from "../../components/wallet/WalletLayout";
import { CreditCard } from "../../types/CreditCard";

interface ParamType {
  readonly card: CreditCard;
}

interface StateParams extends NavigationState {
  readonly params: ParamType;
}

interface OwnProps {
  readonly navigation: NavigationScreenProp<StateParams>;
}

type Props = OwnProps & NavigationInjectedProps;

export default class TransactionsScreen extends React.Component<Props, never> {
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
        cardType={CardType.FULL}
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

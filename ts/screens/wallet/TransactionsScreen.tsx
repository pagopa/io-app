/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as React from "react";
import I18n from "../../i18n";

import { Content, View } from "native-base";
import { Image } from "react-native";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import { WalletLayout } from "../../components/wallet/layout/WalletLayout";
import { TransactionsList } from "../../components/wallet/TransactionsList";
import { CreditCard } from "../../types/CreditCard";
import { WalletTransaction } from "../../types/wallet";

import { topContentTouchable } from "../../components/wallet/layout/types";

const cardsImage = require("../../../img/wallet/card-tab.png");

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

export class TransactionsScreen extends React.Component<Props, never> {

  private touchableContent(): React.ReactElement<any> {
    // TODO: change this with an actual component @https://www.pivotaltracker.com/story/show/157422715
    return (
      <View style={WalletStyles.container}>
        <Image
          style={WalletStyles.pfTabCard}
          source={cardsImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  public render(): React.ReactNode {
    const card: CreditCard = this.props.navigation.state.params.card;
    const transactions: ReadonlyArray<
      WalletTransaction
    > = WalletAPI.getTransactions(card.id);

    const topContent = topContentTouchable(this.touchableContent());

    return (
      <WalletLayout
        headerTitle={I18n.t("wallet.paymentMethod")}
        allowGoBack={true}
        navigation={this.props.navigation}
        title={I18n.t("wallet.creditDebitCards")}
        topContent={topContent}
      >
        <Content style={WalletStyles.whiteContent}>
          <TransactionsList
            title={I18n.t("wallet.transactions")}
            totalAmount={I18n.t("wallet.total")}
            transactions={transactions}
            navigation={this.props.navigation}
          />
        </Content>
      </WalletLayout>
    );
  }
}

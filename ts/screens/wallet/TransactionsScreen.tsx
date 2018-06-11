/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as React from "react";
import I18n from "../../i18n";

import { Content } from "native-base";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import { WalletLayout, SpaceAllocationPolicy } from "../../components/wallet/layout/WalletLayout";
import { TransactionsList } from "../../components/wallet/TransactionsList";
import { CreditCard } from "../../types/CreditCard";
import { WalletTransaction } from "../../types/wallet";

import { topContentTouchable } from "../../components/wallet/layout/types";
import { CreditCardComponent } from "../../components/wallet/card";

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
  private touchableContent(card: CreditCard): React.ReactElement<any> {
    // TODO: change this with an actual component @https://www.pivotaltracker.com/story/show/157422715
    return (
      <CreditCardComponent
        navigation={this.props.navigation}
        item={card}
        favorite={false}
        menu={true}
        lastUsage={false}
        flatBottom={true}
      />
    );
  }

  public render(): React.ReactNode {
    const card: CreditCard = this.props.navigation.state.params.card;
    const transactions: ReadonlyArray<
      WalletTransaction
    > = WalletAPI.getTransactions(card.id);

    const topContent = topContentTouchable(this.touchableContent(card));

    return (
      <WalletLayout
        headerTitle={I18n.t("wallet.paymentMethod")}
        allowGoBack={true}
        navigation={this.props.navigation}
        title={I18n.t("wallet.creditDebitCards")}
        topContent={topContent}
        spaceAllocationPolicy={SpaceAllocationPolicy.TO_AVAILABLE_CONTENTS}
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

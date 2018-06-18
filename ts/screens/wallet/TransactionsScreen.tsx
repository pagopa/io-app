/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as React from "react";
import I18n from "../../i18n";

import { Content, View } from "native-base";
import { Image } from "react-native";
import { NavigationInjectedProps } from "react-navigation";

import { WalletStyles } from "../../components/styles/wallet";
import { topContentTouchable } from "../../components/wallet/layout/types";
import { WalletLayout } from "../../components/wallet/layout/WalletLayout";
import TransactionsList, {
  TransactionsDisplayed
} from "../../components/wallet/TransactionsList";

const cardsImage = require("../../../img/wallet/card-tab.png");

type Props = NavigationInjectedProps;

export default class TransactionsScreen extends React.Component<Props, never> {
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
            navigation={this.props.navigation}
            display={TransactionsDisplayed.BY_CARD}
          />
        </Content>
      </WalletLayout>
    );
  }
}

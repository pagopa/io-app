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
import { WalletLayout } from "../../components/wallet/layout/WalletLayout";
import TransactionsList from "../../components/wallet/TransactionsList";

import { connect, Dispatch } from "react-redux";
import { topContentTouchable } from "../../components/wallet/layout/types";
import { loadTransactionsListBySelectedCard } from "../../store/actions/wallet";

const cardsImage = require("../../../img/wallet/card-tab.png");

type ReduxMappedProps = Readonly<{
  getTransactionsByCard: () => void;
}>;

type Props = ReduxMappedProps & NavigationInjectedProps;

class TransactionsScreen extends React.Component<Props, never> {
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

  public componentWillMount() {
    this.props.getTransactionsByCard();
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
          />
        </Content>
      </WalletLayout>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedProps => ({
  getTransactionsByCard: () => dispatch(loadTransactionsListBySelectedCard())
});
export default connect(undefined, mapDispatchToProps)(TransactionsScreen);

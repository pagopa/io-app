/**
 * This screen shows the list of available payment methods
 * (credit cards for now)
 */

import * as React from "react";

import { Content, List, Text, View } from "native-base";
import { WalletStyles } from "../../components/styles/wallet";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";

import { Button } from "native-base";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import CardComponent from "../../components/wallet/card";
import ROUTES from "../../navigation/routes";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import { walletsSelector } from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";

type ReduxMappedStateProps = Readonly<{
  wallets: ReadonlyArray<Wallet>;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps;

class WalletsScreen extends React.Component<Props> {
  private renderWalletRow = (item: Wallet) => (
    <CardComponent navigation={this.props.navigation} item={item} />
  );

  private navigateToAddPaymentMethod = (): boolean =>
    this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD);

  public render(): React.ReactNode {
    const headerContents = (
      <View style={WalletStyles.walletBannerText}>
        <Text style={WalletStyles.white}>
          {I18n.t("wallet.creditDebitCards")}
        </Text>
      </View>
    );
    return (
      <WalletLayout
        title={I18n.t("wallet.paymentMethods")}
        navigation={this.props.navigation}
        headerContents={headerContents}
      >
        <Content style={WalletStyles.header}>
          <List
            removeClippedSubviews={false}
            dataArray={this.props.wallets as any[]} // tslint:disable-line
            renderRow={this.renderWalletRow}
          />
          <View spacer={true} />
          <Button
            bordered={true}
            block={true}
            style={WalletStyles.addPaymentMethodButton}
            onPress={this.navigateToAddPaymentMethod}
          >
            <Text style={WalletStyles.addPaymentMethodText}>
              {I18n.t("wallet.newPaymentMethod.addButton")}
            </Text>
          </Button>
        </Content>
      </WalletLayout>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  wallets: walletsSelector(state)
});

export default withLoadingSpinner(
  connect(mapStateToProps)(WalletsScreen),
  createLoadingSelector(["WALLET_MANAGEMENT_LOAD"]),
  {}
);

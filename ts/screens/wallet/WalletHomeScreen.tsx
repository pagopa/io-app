/**
 * Wallet home screen, with a list of recent transactions,
 * a "pay notice" button and payment methods info/button to
 * add new ones
 */
import { Button, Content, View } from "native-base";
import * as React from "react";
import { Image, Text, TouchableHighlight } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import {
  topContentSubtitlesLRTouchable,
  topContentSubtitleTouchable
} from "../../components/wallet/layout/types";
import {
  ImageType,
  WalletLayout
} from "../../components/wallet/layout/WalletLayout";
import { TransactionsList } from "../../components/wallet/TransactionsList";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { CreditCard } from "../../types/CreditCard";
import { WalletTransaction } from "../../types/wallet";

type ScreenProps = {};

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ScreenProps & OwnProps;

/**
 * Wallet Home Screen
 */
export class WalletHomeScreen extends React.Component<Props, never> {
  // TODO: currently mocked, will be implemented properly @https://www.pivotaltracker.com/story/show/157422715
  private getCardsSummaryImage(): React.ReactElement<any> {
    const { navigate } = this.props.navigation;
    return (
      <View style={WalletStyles.container}>
        <TouchableHighlight
          onPress={(): boolean => navigate(ROUTES.WALLET_CREDITCARDS)}
        >
          <Image
            style={WalletStyles.pfCards}
            source={require("../../../img/wallet/creditcards.jpg")}
          />
        </TouchableHighlight>
      </View>
    );
  }

  private getEmptyCardsSummary(): React.ReactElement<any> {
    const { navigate } = this.props.navigation;
    return (
      <View style={WalletStyles.container}>
        <Button
          bordered={true}
          block={true}
          style={WalletStyles.addPaymentMethodButton}
          onPress={(): boolean => navigate("")}
        >
          <Text style={WalletStyles.addPaymentMethodText}>
            {I18n.t("wallet.newPaymentMethod.addButton")}
          </Text>
        </Button>
      </View>
    );
  }

  private touchableContent(): React.ReactElement<any> {
    const cards: ReadonlyArray<CreditCard> = WalletAPI.getCreditCards();
    if (cards.length > 0) {
      return this.getCardsSummaryImage();
    } else {
      return this.getEmptyCardsSummary();
    }
  }

  public render(): React.ReactNode {
    const latestTransactions: ReadonlyArray<
      WalletTransaction
    > = WalletAPI.getLatestTransactions();

    const topContents =
      WalletAPI.getCreditCards().length > 0
        ? topContentSubtitlesLRTouchable(
            this.touchableContent(),
            I18n.t("wallet.paymentMethods"),
            I18n.t("wallet.newPaymentMethod.add")
          )
        : topContentSubtitleTouchable(
            this.touchableContent(),
            I18n.t("wallet.newPaymentMethod.addDescription")
          );

    return (
      <WalletLayout
        headerTitle={I18n.t("wallet.wallet")}
        allowGoBack={false}
        navigation={this.props.navigation}
        title={I18n.t("wallet.wallet")}
        topContent={topContents}
        rightImage={ImageType.BANK_IMAGE}
      >
        <Content style={WalletStyles.whiteContent}>
          <TransactionsList
            title={I18n.t("wallet.latestTransactions")}
            totalAmount={I18n.t("wallet.total")}
            transactions={latestTransactions}
            navigation={this.props.navigation}
          />
        </Content>
      </WalletLayout>
    );
  }
}

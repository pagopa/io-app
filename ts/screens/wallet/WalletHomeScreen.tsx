import { Button, Content, View } from "native-base";
import * as React from "react";
import { Image, Text, TouchableHighlight } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles";
import { OperationsList } from "../../components/wallet/OperationsList";
import {
  ImageType,
  PayLayout
} from "../../components/wallet/pay-layout/PayLayout";
import {
  topContentSubtitlesLRTouchable,
  topContentSubtitleTouchable
} from "../../components/wallet/pay-layout/types";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { CreditCard } from "../../types/wallet/CreditCard";
import { Operation } from "../../types/wallet/types";

type ScreenProps = {};

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ScreenProps & OwnProps;

/**
 * Wallet Home Screen
 */
export class WalletHomeScreen extends React.Component<Props, never> {
  public static navigationOptions = {
    title: I18n.t("wallet.wallet"),
    headerBackTitle: null
  };

  constructor(props: Props) {
    super(props);
  }

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
    const TITLE = I18n.t("wallet.wallet");
    const latestOperations: ReadonlyArray<
      Operation
    > = WalletAPI.getLatestOperations();

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
      <PayLayout
        navigation={this.props.navigation}
        title={TITLE}
        topContent={topContents}
        rightImage={ImageType.BANK_IMAGE}
      >
        <Content style={WalletStyles.whiteContent}>
          <OperationsList
            parent={I18n.t("wallet.wallet")}
            title={I18n.t("wallet.lastOperations")}
            totalAmount={I18n.t("wallet.total")}
            operations={latestOperations}
            navigation={this.props.navigation}
          />
        </Content>
      </PayLayout>
    );
  }
}

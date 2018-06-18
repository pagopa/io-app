/**
 * This screen shows the list of available payment methods
 * (credit cards for now)
 */

import * as React from "react";

import { Content, List, Text, View } from "native-base";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import { WalletLayout } from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";

import { Button } from "native-base";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import CreditCardComponent from "../../components/wallet/CreditCardComponent";
import ROUTES from "../../navigation/routes";
import { CreditCard } from "../../types/CreditCard";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const cards: ReadonlyArray<CreditCard> = WalletAPI.getCreditCards();

export class CreditCardsScreen extends React.Component<Props, never> {
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
        <Content style={WalletStyles.backContent}>
          <List
            removeClippedSubviews={false}
              dataArray={cards as any[]} // tslint:disable-line
            renderRow={(item): React.ReactElement<any> => (
              <CreditCardComponent
                navigation={this.props.navigation}
                item={item}
              />
            )}
          />
          <View spacer={true} />
          <Button
            bordered={true}
            block={true}
            style={WalletStyles.addPaymentMethodButton}
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD)
            }
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

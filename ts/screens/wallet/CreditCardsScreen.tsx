/**
 * This screen shows the list of available payment methods
 * (credit cards for now)
 */

import * as React from "react";

import { Text, Content, List, View } from "native-base";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles/wallet";
import { WalletLayout } from "../../components/wallet/layout";
import I18n from "../../i18n";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import CreditCardComponent from "../../components/wallet/CreditCardComponent";
import { CreditCard } from "../../types/CreditCard";
import { Button } from 'native-base';
import ROUTES from '../../navigation/routes';

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const cards: ReadonlyArray<CreditCard> = WalletAPI.getCreditCards();

export class CreditCardsScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
    const headerContents = (
      <View style={WalletStyles.walletBannerText}>
        <Text style={WalletStyles.white}>{I18n.t("wallet.creditDebitCards")}</Text>
      </View>
    );
    return (
      <WalletLayout
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
            <View spacer={true}/>
            <Button
              bordered={true}
              block={true}
              style={WalletStyles.addPaymentMethodButton}
              onPress={(): boolean => this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD)}
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

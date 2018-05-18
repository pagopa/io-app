/**
 * This screen shows the list of available payment methods
 * (credit cards for now) 
 */

import * as React from "react";

import { Content, List, View } from "native-base";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles";
import { WalletLayout } from "../../components/wallet/layout/WalletLayout";
import I18n from "../../i18n";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import CreditCardComponent from "../../components/wallet/CreditCardComponent";
import { topContentNone } from "../../components/wallet/layout/types";
import { CreditCard } from "../../types/CreditCard";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const cards: ReadonlyArray<CreditCard> = WalletAPI.getCreditCards();

export class CreditCardsScreen extends React.Component<Props, never> {
  public static navigationOptions = {
    title: I18n.t("wallet.wallet"),
    headerBackTitle: null
  };

  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    return (
      <WalletLayout
        navigation={this.props.navigation}
        title={I18n.t("wallet.creditcards")}
        topContent={topContentNone()}
      >
        <Content style={WalletStyles.backContent}>
          <View style={{ minHeight: 400 }}>
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
          </View>
        </Content>
      </WalletLayout>
    );
  }
}

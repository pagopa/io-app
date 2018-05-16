import * as React from "react";

import { Content, List, View } from "native-base";
import { WalletAPI } from "../../api/wallet/wallet-api";
import { WalletStyles } from "../../components/styles";
import { PayLayout } from "../../components/wallet/pay-layout/PayLayout";
import I18n from "../../i18n";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import CreditCardComponent from "../../components/wallet/CreditCardComponent";
import { topContentNone } from "../../components/wallet/pay-layout/types";
import { CreditCard } from "../../types/wallet/CreditCard";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const cards: ReadonlyArray<CreditCard> = WalletAPI.getCreditCards();

/**
 * Select Credit Card
 */
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
      <PayLayout
        navigation={this.props.navigation}
        title={I18n.t("wallet.creditcards")}
        topContent={topContentNone()}
      >
        <Content style={WalletStyles.pfback}>
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
      </PayLayout>
    );
  }
}

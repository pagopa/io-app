/**
 * This screen shows the list of available payment methods
 * (credit cards for now)
 */

import * as React from "react";

import { Content, List, View } from "native-base";
import { WalletStyles } from "../../components/styles/wallet";
import { WalletLayout } from "../../components/wallet/layout/WalletLayout";
import I18n from "../../i18n";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import CreditCardComponent from "../../components/wallet/CreditCardComponent";
import { topContentNone } from "../../components/wallet/layout/types";
import { GlobalState } from "../../store/reducers/types";
import { creditCardsSelector } from "../../store/reducers/wallet/cards";
import { CreditCard } from "../../types/CreditCard";

type ReduxMappedStateProps = Readonly<{
  cards: ReadonlyArray<CreditCard>;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps;

class CreditCardsScreen extends React.Component<Props, never> {
  public render(): React.ReactNode {
    return (
      <WalletLayout
        headerTitle={I18n.t("wallet.wallet")}
        allowGoBack={true}
        navigation={this.props.navigation}
        title={I18n.t("wallet.creditcards")}
        topContent={topContentNone()}
      >
        <Content style={WalletStyles.backContent}>
          <View style={{ minHeight: 400 }}>
            <List
              removeClippedSubviews={false}
              dataArray={this.props.cards as any[]} // tslint:disable-line
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

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  cards: creditCardsSelector(state)
});
export default connect(mapStateToProps)(CreditCardsScreen);

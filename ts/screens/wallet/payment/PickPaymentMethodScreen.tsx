/**
 * This screen allows the user to select the payment method for a selected transaction
 * TODO:
 *  - implement the proper navigation
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158395136
 */
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  List,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import IconFont from "../../../components/ui/IconFont";
import CreditCardComponent from "../../../components/wallet/card";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { GlobalState } from "../../../store/reducers/types";
import { creditCardsSelector } from "../../../store/reducers/wallet/cards";
import { CreditCard, CreditCardId } from "../../../types/CreditCard";
import { Dispatch } from '../../../store/actions/types';
import { confirmPaymentMethod } from '../../../store/actions/wallet/payment';
import { LogoPosition } from '../../../components/wallet/card/Logo';

type ReduxMappedStateProps = Readonly<{
  cards: ReadonlyArray<CreditCard>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  confirmPaymentMethod: (cardId: CreditCardId) => void
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

class PickPaymentMethodScreen extends React.Component<Props> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.payWith.header")}</Text>
          </Body>
        </AppHeader>
        <Content noPadded={true}>
          <PaymentBannerComponent
            navigation={this.props.navigation}
          />

          <View style={WalletStyles.paddedLR}>
            <View spacer={true} />
            <H1> {I18n.t("wallet.payWith.title")} </H1>
            <View spacer={true} />
            <Text> {I18n.t("wallet.payWith.info")}</Text>
            <View spacer={true} />
            <List
              removeClippedSubviews={false}
              dataArray={this.props.cards as any[]} // tslint:disable-line: readonly-array
              renderRow={(item): React.ReactElement<any> => (
                <CreditCardComponent
                  navigation={this.props.navigation}
                  item={item}
                  menu={false}
                  favorite={false}
                  lastUsage={false}
                  mainAction={this.props.confirmPaymentMethod}
                  logoPosition={LogoPosition.TOP}
                />
              )}
            />
          </View>
        </Content>
        <View footer={true}>
          <Button
            block={true}
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD)
            }
          >
            <Text>{I18n.t("wallet.newPaymentMethod.newMethod")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            cancel={true}
            onPress={(): boolean => this.props.navigation.goBack()}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

/**
 * selectors will be reviewed in next pr
 */
const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  cards: creditCardsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  confirmPaymentMethod: (cardId: CreditCardId) => dispatch(confirmPaymentMethod(cardId))
});

export default connect(mapStateToProps, mapDispatchToProps)(PickPaymentMethodScreen);

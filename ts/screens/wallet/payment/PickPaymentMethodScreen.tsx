/**
 * This screen allows the user to select the payment method for a selected transaction
 * TODO: "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
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
import { Wallet } from "../../../../definitions/pagopa/Wallet";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import FooterButtons from "../../../components/ui/FooterButtons";
import IconFont from "../../../components/ui/IconFont";
import CardComponent from "../../../components/wallet/card";
import { LogoPosition } from "../../../components/wallet/card/Logo";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestConfirmPaymentMethod,
  paymentRequestGoBack
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { getPaymentStep } from "../../../store/reducers/wallet/payment";
import { walletsSelector } from "../../../store/reducers/wallet/wallets";

type ReduxMappedStateProps =
  | Readonly<{
      valid: false;
    }>
  | Readonly<{
      valid: true;
      wallets: ReadonlyArray<Wallet>;
    }>;

type ReduxMappedDispatchProps = Readonly<{
  confirmPaymentMethod: (walletId: number) => void;
  goBack: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

class PickPaymentMethodScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }

    const primaryButtonProps = {
      block: true,
      onPress: () =>
        this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD),
      title: I18n.t("wallet.newPaymentMethod.newMethod")
    };

    const secondaryButtonProps = {
      block: true,
      cancel: true,
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.props.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.payWith.header")}</Text>
          </Body>
        </AppHeader>
        <Content noPadded={true}>
          <PaymentBannerComponent navigation={this.props.navigation} />

          <View style={WalletStyles.paddedLR}>
            <View spacer={true} />
            <H1> {I18n.t("wallet.payWith.title")} </H1>
            <View spacer={true} />
            <Text> {I18n.t("wallet.payWith.info")}</Text>
            <View spacer={true} />
            <List
              removeClippedSubviews={false}
              dataArray={this.props.wallets as any[]} // tslint:disable-line: readonly-array
              renderRow={(item): React.ReactElement<any> => (
                <CardComponent
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

        <FooterButtons
          leftButton={primaryButtonProps}
          rightButton={secondaryButtonProps}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps =>
  getPaymentStep(state) === "PaymentStatePickPaymentMethod"
    ? {
        valid: true,
        wallets: walletsSelector(state)
      }
    : { valid: false };

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  confirmPaymentMethod: (walletId: number) =>
    dispatch(paymentRequestConfirmPaymentMethod(walletId)),
  goBack: () => dispatch(paymentRequestGoBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PickPaymentMethodScreen);

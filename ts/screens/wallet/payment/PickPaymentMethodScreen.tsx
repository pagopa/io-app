/**
 * This screen allows the user to select the payment method for a selected transaction
 * TODO: "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */
import {
  Body,
  Container,
  Content,
  H1,
  Left,
  List,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import GoBackButton from "../../../components/GoBackButton";
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import CardComponent from "../../../components/wallet/card";
import { LogoPosition } from "../../../components/wallet/card/Logo";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestConfirmPaymentMethod,
  paymentRequestGoBack,
  paymentRequestTransactionSummaryFromBanner
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { getPaymentStep } from "../../../store/reducers/wallet/payment";
import { walletsSelector } from "../../../store/reducers/wallet/wallets";
import { Wallet } from "../../../types/pagopa";

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
  showSummary: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

class PickPaymentMethodScreen extends React.Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    // avoids updating the component on invalid props to avoid having the screen
    // become blank during transitions from one payment state to another
    // FIXME: this is quite fragile, we should instead avoid having a shared state
    return nextProps.valid;
  }

  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }

    const primaryButtonProps = {
      block: true,
      onPress: () =>
        this.props.navigation.navigate(ROUTES.WALLET_ADD_PAYMENT_METHOD),
      title: I18n.t("wallet.newPaymentMethod.addButton")
    };

    const secondaryButtonProps = {
      block: true,
      cancel: true,
      onPress: this.props.showSummary,
      title: I18n.t("global.buttons.cancel")
    };

    const { wallets } = this.props;

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton onPress={this.props.goBack} />
          </Left>
          <Body>
            <Text>{I18n.t("wallet.payWith.header")}</Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>
        <Content noPadded={true}>
          <PaymentBannerComponent navigation={this.props.navigation} />

          <View style={WalletStyles.paddedLR}>
            <View spacer={true} />
            <H1>
              {I18n.t(
                wallets.length > 0
                  ? "wallet.payWith.title"
                  : "wallet.payWith.noWallets.title"
              )}
            </H1>
            <View spacer={true} />
            <Text>
              {I18n.t(
                wallets.length > 0
                  ? "wallet.payWith.text"
                  : "wallet.payWith.noWallets.text"
              )}
            </Text>
            <View spacer={true} />
            <List
              removeClippedSubviews={false}
              dataArray={wallets as any[]} // tslint:disable-line: readonly-array
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

        <FooterWithButtons
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
  goBack: () => dispatch(paymentRequestGoBack()),
  showSummary: () => dispatch(paymentRequestTransactionSummaryFromBanner())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PickPaymentMethodScreen);

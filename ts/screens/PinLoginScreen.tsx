/**
 * A screen that allows the user to:
 * - unlock the app with a PIN
 * - confirm to proceed with a payment by a PIN
 * - cancel the payment process from the screen
 */

import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { StatusBar } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import Pinpad from "../components/Pinpad";
import BaseScreenComponent from "../components/screens/BaseScreenComponent";
import IconFont from "../components/ui/IconFont";
import TextWithIcon from "../components/ui/TextWithIcon";
import I18n from "../i18n";
import { pinLoginValidateRequest } from "../store/actions/pinlogin";
import { startPinReset } from "../store/actions/pinset";
import { ReduxProps } from "../store/actions/types";
import { paymentRequestTransactionSummaryFromBanner } from "../store/actions/wallet/payment";
import { AppState } from "../store/reducers/appState";
import { PinLoginState } from "../store/reducers/pinlogin";
import { GlobalState } from "../store/reducers/types";
import variables from "../theme/variables";
import { PinString } from "../types/PinString";
import { ContextualHelpInjectedProps } from "./../components/helpers/withContextualHelp";
import { isPaymentStarted } from "./../store/reducers/wallet/payment";

type ReduxMappedProps = {
  pinLoginState: PinLoginState;
  appState: AppState;
  isPaymentStarted: boolean;
};

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxMappedProps &
  ReduxProps &
  OwnProps &
  ContextualHelpInjectedProps;

type CodeInputRef = Pinpad | null;
/**
 * A screen that allows the user to unlock the app with a PIN.
 */
class PinLoginScreen extends React.Component<Props> {
  private pinComponent: CodeInputRef = null;

  public componentDidUpdate(prevProps: Props) {
    // Clear pin input when the application state changes from non-active to active
    if (
      !!this.pinComponent &&
      prevProps.appState.appState !== "active" &&
      this.props.appState.appState === "active"
    ) {
      this.pinComponent.clear();
    }
  }

  private onPinReset = () => {
    this.props.dispatch(startPinReset);
  };

  private goToPaymentSummary = () => {
    this.props.dispatch(paymentRequestTransactionSummaryFromBanner());
  };

  // Method called when the CodeInput is filled
  public onPinFulfill = (code: PinString) => {
    const validatePinAction = pinLoginValidateRequest(code);
    this.props.dispatch(validatePinAction);
    // Clear PIN input
    if (this.pinComponent) {
      this.pinComponent.clear();
    }
  };

  public handleCodeInputRef = (pinpad: CodeInputRef) =>
    (this.pinComponent = pinpad); // tslint:disable-line no-object-mutation

  // Render the PIN match/doesn't match feedback message
  public renderCodeInputConfirmValidation() {
    const validationMessage = (
      <TextWithIcon danger={true}>
        <IconFont name="io-close" color={variables.colorWhite} />
        <Text white={true}>{I18n.t("pin_login.pin.confirmInvalid")}</Text>
      </TextWithIcon>
    );
    return (
      <React.Fragment>
        <View spacer={true} extralarge={true} />
        {validationMessage}
      </React.Fragment>
    );
  }

  // Render select/confirm Pinpad component
  public renderCodeInput(pinLoginState: PinLoginState) {
    const isPinInvalid = pinLoginState.PinConfirmed === "PinConfirmedInvalid";
    return (
      <React.Fragment>
        <Pinpad
          onFulfill={this.onPinFulfill}
          activeColor={variables.colorWhite}
          inactiveColor={variables.colorWhite}
          ref={this.handleCodeInputRef}
        />

        {isPinInvalid && this.renderCodeInputConfirmValidation()}
      </React.Fragment>
    );
  }

  public render() {
    const { pinLoginState } = this.props;
    const contextualHelp = {
      title: I18n.t("pin_login.unlock_screen.help.title"),
      body: () => I18n.t("pin_login.unlock_screen.help.content")
    };
    return (
      <BaseScreenComponent primary={true} contextualHelp={contextualHelp}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={variables.contentPrimaryBackground}
        />
        <Content primary={true}>
          <View spacer={true} extralarge={true} />
          <Text white={true} alignCenter={true}>
            {I18n.t("pin_login.pin.pinInfo")}
          </Text>
          {this.renderCodeInput(pinLoginState)}
          <View spacer={true} extralarge={true} />
          {this.props.isPaymentStarted ? (
            <Button
              light={true}
              bordered={true}
              block={true}
              primary={true}
              white={true}
              onPress={this.goToPaymentSummary}
            >
              <Text>{I18n.t("wallet.ConfirmPayment.cancelPayment")}</Text>
            </Button>
          ) : (
            <View>
              <Button block={true} primary={true} onPress={this.onPinReset}>
                <Text>{I18n.t("pin_login.pin.reset.button")}</Text>
              </Button>
              <View spacer={true} />
              <Text white={true}>{I18n.t("pin_login.pin.reset.tip")}</Text>
            </View>
          )}
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = ({
  pinlogin,
  appState,
  wallet
}: GlobalState): ReduxMappedProps => ({
  // Checks from the store whether there was an error while login with the PIN (e.g. PIN is not valid )
  pinLoginState: pinlogin,
  appState,
  isPaymentStarted: isPaymentStarted(wallet)
});

export default connect(mapStateToProps)(PinLoginScreen);

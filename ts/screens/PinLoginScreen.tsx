/**
 * A screen that allows the user to:
 * - unlock the app with a PIN
 * - complete a payment with a PIN
 * - cancel the payment process from the related link
 */

import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { StatusBar } from "react-native";
import CodeInput from "react-native-confirmation-code-input";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import GoBackLink from "../components/GoBackLink";
import { ContextualHelpInjectedProps } from "../components/helpers/withContextualHelp";
import Pinpad from "../components/Pinpad";
import BaseScreenComponent from "../components/screens/BaseScreenComponent";
import IconFont from "../components/ui/IconFont";
import TextWithIcon from "../components/ui/TextWithIcon";
import I18n from "../i18n";
import { pinLoginValidateRequest } from "../store/actions/pinlogin";
import { startPinReset } from "../store/actions/pinset";
import { ReduxProps } from "../store/actions/types";
import { AppState } from "../store/reducers/appState";
import { PinLoginState } from "../store/reducers/pinlogin";
import { GlobalState } from "../store/reducers/types";
import variables from "../theme/variables";
import { PinString } from "../types/PinString";

type ReduxMappedProps = {
  pinLoginState: PinLoginState;
  appState: AppState;
};

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxMappedProps &
  ReduxProps &
  OwnProps &
  ContextualHelpInjectedProps;

type CodeInputRef = CodeInput | null;

class PinScreen extends React.Component<Props> {
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
        <IconFont name="io-close" />
        <Text>{I18n.t("pin_login.pin.confirmInvalid")}</Text>
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
          autofocus={true}
          onFulfill={this.onPinFulfill}
          activeColor={variables.colorWhite}
          inactiveColor={variables.colorWhite}
          codeInputRef={this.handleCodeInputRef}
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
          <Button block={true} primary={true} onPress={this.onPinReset}>
            <Text>{I18n.t("pin_login.pin.reset.button")}</Text>
          </Button>
          <View spacer={true} />
          <Text white={true}>{I18n.t("pin_login.pin.reset.tip")}</Text>
          <View spacer={true} />
          <GoBackLink navigation={this.props.navigation} />
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = ({
  pinlogin,
  appState
}: GlobalState): ReduxMappedProps => ({
  // Checks from the store whether there was an error while login with the PIN (e.g. PIN is not valid )
  pinLoginState: pinlogin,
  appState
});

export default connect(mapStateToProps)(PinScreen);

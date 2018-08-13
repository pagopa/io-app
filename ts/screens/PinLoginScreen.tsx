import * as React from "react";

import { Button, Content, Text, View } from "native-base";

import { connect } from "react-redux";

import CodeInput from "react-native-confirmation-code-input";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../i18n";

import variables from "../theme/variables";

import Pinpad from "../components/Pinpad";
import BaseScreenComponent from "../components/screens/BaseScreenComponent";
import IconFont from "../components/ui/IconFont";
import TextWithIcon from "../components/ui/TextWithIcon";

import { pinLoginValidateRequest } from "../store/actions/pinlogin";
import { ReduxProps } from "../store/actions/types";
import { PinLoginState } from "../store/reducers/pinlogin";
import { GlobalState } from "../store/reducers/types";

import { ContextualHelpInjectedProps } from "../components/helpers/withContextualHelp";
import { startPinReset } from "../store/actions/pinset";
import { PinString } from "../types/PinString";

type ReduxMappedProps = {
  pinLoginState: PinLoginState;
};

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxMappedProps &
  ReduxProps &
  OwnProps &
  ContextualHelpInjectedProps;

/**
 * A screen that allows the user to unlock the app with a PIN.
 */
class PinLoginScreen extends React.Component<Props> {
  private pinComponent: CodeInput | null = null;

  constructor(props: Props) {
    super(props);
  }

  private onPinReset = () => {
    this.props.dispatch(startPinReset());
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
          codeInputRef={pinpad => (this.pinComponent = pinpad)} // tslint:disable-line no-object-mutation
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
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  // Checks from the store whether there was an error while login with the PIN (e.g. PIN is not valid )
  pinLoginState: state.pinlogin
});

export default connect(mapStateToProps)(PinLoginScreen);

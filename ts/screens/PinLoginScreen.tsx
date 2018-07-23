import * as React from "react";

import {
  Button,
  Container,
  Content,
  Header,
  Right,
  Text,
  View
} from "native-base";

import { TouchableHighlight } from "react-native";

import { connect } from "react-redux";

import CodeInput from "react-native-confirmation-code-input";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../i18n";

import variables from "../theme/variables";

import Pinpad from "../components/Pinpad";
import IconFont from "../components/ui/IconFont";
import TextWithIcon from "../components/ui/TextWithIcon";

import { validatePin } from "../store/actions/pinlogin";
import { ReduxProps } from "../store/actions/types";
import { PinLoginState } from "../store/reducers/pinlogin";
import { GlobalState } from "../store/reducers/types";

import {
  ContextualHelpInjectedProps,
  withContextualHelp
} from "../components/helpers/withContextualHelp";

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

  // Method called when the CodeInput is filled
  public onPinFulfill(code: string) {
    this.props.dispatch(validatePin(code));
    // Clear PIN input
    if (this.pinComponent) {
      this.pinComponent.clear();
    }
  }

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

  // Render the forgot PIN button
  public renderForgotButton() {
    return (
      <Button block={true} primary={true}>
        <Text>{I18n.t("pin_login.pin.pinForgot")}</Text>
      </Button>
    );
  }

  public render() {
    const { pinLoginState } = this.props;
    return (
      <Container>
        <Header primary={true}>
          <Right>
            <TouchableHighlight onPress={this.props.showHelp}>
              <IconFont name="io-question" />
            </TouchableHighlight>
          </Right>
        </Header>
        <Content primary={true}>
          <View spacer={true} extralarge={true} />
          <Text white={true} alignCenter={true}>
            {I18n.t("pin_login.pin.pinInfo")}
          </Text>
          {this.renderCodeInput(pinLoginState)}
          <View spacer={true} extralarge={true} />
          {this.renderForgotButton()}
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  // Checks from the store whether there was an error while login with the PIN (e.g. PIN is not valid )
  pinLoginState: state.pinlogin
});

export default connect(mapStateToProps)(
  withContextualHelp(
    PinLoginScreen,
    I18n.t("pin_login.unlock_screen.help.title"),
    I18n.t("pin_login.unlock_screen.help.content")
  )
);

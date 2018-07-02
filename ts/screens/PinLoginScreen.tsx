import { Button, Container, Content, Text, View } from "native-base";
import * as React from "react";
import CodeInput from "react-native-confirmation-code-input";
import { NavigationScreenProps, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import Pinpad from "../components/Pinpad";
import IconFont from "../components/ui/IconFont";
import TextWithIcon from "../components/ui/TextWithIcon";
import I18n from "../i18n";
import { validatePin } from "../store/actions/pinlogin";
import { ReduxProps } from "../store/actions/types";
import { PinLoginState } from "../store/reducers/pinlogin";
import { GlobalState } from "../store/reducers/types";
import variables from "../theme/variables";

type ReduxMappedProps = {
  pinLoginState: PinLoginState;
};
type OwnProps = NavigationScreenProps<NavigationState>;

type Props = ReduxMappedProps & ReduxProps & OwnProps;

/**
 * A screen that allow the user to login with the PIN.
 */
class PinLoginScreen extends React.Component<Props> {
  private pinComponent: CodeInput | null = null;

  constructor(props: Props) {
    super(props);
  }

  // Method called when the CodeInput is filled
  public onPinFulfill = (code: string) => {
    this.props.dispatch(validatePin(code));
    // Clear PIN input
    if (this.pinComponent) {
      this.pinComponent.clear();
    }
  };

  // Render the PIN match/doesn't match feedback message
  public renderCodeInputConfirmValidation = () => {
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
  };

  // Render select/confirm Pinpad component
  public renderCodeInput = (pinLoginState: PinLoginState) => {
    return (
      <React.Fragment>
        <Pinpad
          autofocus={true}
          onFulfill={this.onPinFulfill}
          activeColor={variables.colorWhite}
          inactiveColor={variables.colorWhite}
          codeInputRef={pinpad => (this.pinComponent = pinpad)} // tslint:disable-line no-object-mutation
        />

        {pinLoginState.PinConfirmed === "PinConfirmedInvalid" &&
          this.renderCodeInputConfirmValidation()}
      </React.Fragment>
    );
  };

  // The Content of the Screen
  public renderContent = (pinLoginState: PinLoginState) => {
    return (
      <Content primary={true}>
        <View spacer={true} extralarge={true} />
        <Text white={true} alignCenter={true}>
          {I18n.t("pin_login.pin.pinInfo")}
        </Text>
        {this.renderCodeInput(pinLoginState)}
        <View spacer={true} extralarge={true} />
        {this.renderForgotButton()}
      </Content>
    );
  };
  // Render the forgot PIN button
  public renderForgotButton = () => {
    return (
      <Button block={true} primary={true}>
        <Text>{I18n.t("pin_login.pin.pinForgot")}</Text>
      </Button>
    );
  };

  public render() {
    const { pinLoginState } = this.props;
    return <Container>{this.renderContent(pinLoginState)}</Container>;
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  // Checks from the store whether there was an error while login with the PIN (e.g. PIN is not valid )
  pinLoginState: state.pinlogin
});
export default connect(mapStateToProps)(PinLoginScreen);

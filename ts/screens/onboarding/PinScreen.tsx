import { Option } from "fp-ts/lib/Option";
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import CodeInput from "react-native-confirmation-code-input";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import GoBackButton from "../../components/GoBackButton";
import Pinpad from "../../components/Pinpad";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import TextWithIcon from "../../components/ui/TextWithIcon";
import I18n from "../../i18n";
import { createPin } from "../../store/actions/pinset";
import { ReduxProps } from "../../store/actions/types";
import { createErrorSelector } from "../../store/reducers/error";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { PinString } from "../../types/PinString";

type ReduxMappedProps = {
  pinSaveError: Option<string>;
};

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxMappedProps & ReduxProps & OwnProps;

type PinUnselected = {
  state: "PinUnselected";
};

type PinSelected = {
  state: "PinSelected";
  // User selected PIN
  pin: PinString;
};

type PinConfirmed = {
  state: "PinConfirmed";
  pin: PinString;
  // True if the confirmation PIN match
  isConfirmationPinMatch: boolean;
};

type PinState = PinUnselected | PinSelected | PinConfirmed;

type State = {
  pinState: PinState;
};

/**
 * A screen that allow the user to set the PIN.
 */
class PinScreen extends React.Component<Props, State> {
  private pinConfirmComponent: CodeInput | null = null;

  constructor(props: Props) {
    super(props);

    // Initial state with PinUnselected
    this.state = {
      pinState: {
        state: "PinUnselected"
      }
    };
  }

  // Method called when the first CodeInput is filled
  public onPinFulfill(code: PinString) {
    this.setState({
      pinState: {
        state: "PinSelected",
        pin: code
      }
    });
  }

  // Method called when the confirmation CodeInput is filled
  public onPinConfirmFulfill(code: PinString, isValid: boolean) {
    // If the inserted PIN do not match we clear the component to let the user retry
    if (!isValid) {
      if (this.pinConfirmComponent) {
        this.pinConfirmComponent.clear();
      }
    }
    this.setState({
      pinState: {
        state: "PinConfirmed",
        pin: code,
        isConfirmationPinMatch: isValid
      }
    });
  }

  public onPinReset() {
    if (this.pinConfirmComponent) {
      this.pinConfirmComponent.clear();
    }
    this.setState({
      pinState: {
        state: "PinUnselected"
      }
    });
  }

  // Dispatch the Action that save the PIN in the Keychain
  public createPin(pin: PinString) {
    this.props.dispatch(createPin(pin));
  }

  // Render a different header when the user need to confirm the PIN
  public renderContentHeader(pinState: PinState) {
    if (pinState.state === "PinUnselected") {
      return <H1>{I18n.t("onboarding.pin.contentTitle")}</H1>;
    } else {
      return <H1>{I18n.t("onboarding.pin.contentTitleConfirm")}</H1>;
    }
  }

  // Render the PIN match/doesn't match feedback message
  public renderCodeInputConfirmValidation(pinState: PinConfirmed) {
    const validationMessage = pinState.isConfirmationPinMatch ? (
      <TextWithIcon success={true}>
        <IconFont name="io-tick-big" />
        <Text>{I18n.t("onboarding.pin.confirmValid")}</Text>
      </TextWithIcon>
    ) : (
      <TextWithIcon danger={true}>
        <IconFont name="io-close" />
        <Text>{I18n.t("onboarding.pin.confirmInvalid")}</Text>
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
  public renderCodeInput(pinState: PinState) {
    if (pinState.state === "PinUnselected") {
      /**
       * The component that allows the user to SELECT the PIN.
       */
      return (
        <Pinpad
          inactiveColor={variables.brandLightGray}
          activeColor={variables.brandDarkGray}
          onFulfill={this.onPinFulfill}
        />
      );
    } else {
      /**
       * The component that allows the user to CONFIRM the PIN.
       */
      return (
        <React.Fragment>
          <Pinpad
            inactiveColor={variables.brandLightGray}
            activeColor={variables.brandDarkGray}
            compareWithCode={pinState.pin}
            onFulfill={this.onPinConfirmFulfill}
            ref={pinpad => (this.pinConfirmComponent = pinpad)} // tslint:disable-line no-object-mutation
          />

          {pinState.state === "PinConfirmed" &&
            this.renderCodeInputConfirmValidation(pinState)}
        </React.Fragment>
      );
    }
  }

  // The Content of the Screen
  public renderContent(pinState: PinState) {
    return (
      <Content>
        {this.renderContentHeader(pinState)}
        {this.renderCodeInput(pinState)}
        <View spacer={true} extralarge={true} />
        {this.renderDescription(pinState)}
      </Content>
    );
  }

  // Render the description for the different states
  public renderDescription(pinState: PinState) {
    if (pinState.state === "PinUnselected") {
      return <Text>{I18n.t("onboarding.pin.pinInfo")}</Text>;
    } else {
      return <Text>{I18n.t("onboarding.pin.pinInfoSelected")}</Text>;
    }
  }

  public renderContinueButton(pinState: PinState) {
    if (pinState.state === "PinConfirmed") {
      const { pin, isConfirmationPinMatch } = pinState;

      if (isConfirmationPinMatch) {
        const onPress = () => this.createPin(pin);
        return (
          <React.Fragment>
            <Button
              block={true}
              primary={true}
              disabled={!isConfirmationPinMatch}
              onPress={onPress}
            >
              <Text>{I18n.t("onboarding.pin.continue")}</Text>
            </Button>
            <View spacer={true} />
          </React.Fragment>
        );
      } else {
        return;
      }
    } else {
      return;
    }
  }

  // The Footer of the Screen
  public renderFooter(pinState: PinState) {
    return (
      <View footer={true}>
        {this.renderContinueButton(pinState)}

        {pinState.state !== "PinUnselected" && (
          <React.Fragment>
            <Button
              block={true}
              bordered={true}
              onPress={_ => this.onPinReset()}
            >
              <Text>{I18n.t("onboarding.pin.reset")}</Text>
            </Button>
          </React.Fragment>
        )}
      </View>
    );
  }

  public render() {
    const { pinState } = this.state;

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            <Text>{I18n.t("onboarding.tos.headerTitle")}</Text>
          </Body>
        </AppHeader>
        {this.renderContent(pinState)}
        {pinState.state !== "PinUnselected" && this.renderFooter(pinState)}
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  // Checks from the store whether there was an error while creating the PIN (e.g. saving into the Keystore)
  pinSaveError: createErrorSelector(["PIN_CREATE"])(state)
});

export default connect(mapStateToProps)(PinScreen);

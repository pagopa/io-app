/**
 * A screen that allow the user to set the PIN.
 */

import * as pot from "italia-ts-commons/lib/pot";
import { Button, Content, H3, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import AbortOnboardingModal from "../../components/AbortOnboardingModal";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";

import Pinpad from "../../components/Pinpad";
import IconFont from "../../components/ui/IconFont";
import TextWithIcon from "../../components/ui/TextWithIcon";
import I18n from "../../i18n";
import { abortOnboarding } from "../../store/actions/onboarding";
import { createPinSuccess } from "../../store/actions/pinset";
import { ReduxProps } from "../../store/actions/types";
import variables from "../../theme/variables";
import { PinString } from "../../types/PinString";
import { setPin } from "../../utils/keychain";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps;

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

type PinSaved = {
  state: "PinSaved";
  pin: PinString;
  savedPin: pot.Pot<PinString, string>;
};

type PinState = PinUnselected | PinSelected | PinConfirmed | PinSaved;

type State = {
  pinState: PinState;
  showAbortOnboardingModal: boolean;
};

const styles = StyleSheet.create({
  header: { lineHeight: 40 }
});

class PinScreen extends React.Component<Props, State> {
  private pinConfirmComponent: Pinpad | null = null;

  constructor(props: Props) {
    super(props);

    // Initial state with PinUnselected
    this.state = {
      pinState: {
        state: "PinUnselected"
      },
      showAbortOnboardingModal: false
    };
  }

  // Method called when the first CodeInput is filled
  public onPinFulfill = (code: PinString) =>
    this.setState({
      pinState: {
        state: "PinSelected",
        pin: code
      }
    });

  // Method called when the confirmation CodeInput is filled
  public onPinConfirmFulfill = (code: PinString, isValid: boolean) => {
    // If the inserted PIN do not match we clear the component to let the user retry
    if (!isValid && this.pinConfirmComponent) {
      this.pinConfirmComponent.clear();
    }
    this.setState({
      pinState: {
        state: "PinConfirmed",
        pin: code,
        isConfirmationPinMatch: isValid
      }
    });
  };

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

  // Render a different header when the user need to confirm the PIN
  public renderContentHeader(pinState: PinState) {
    if (pinState.state === "PinUnselected") {
      return (
        <H3 style={styles.header}>{I18n.t("onboarding.pin.contentTitle")}</H3>
      );
    } else {
      return (
        <H3 style={styles.header}>
          {I18n.t("onboarding.pin.contentTitleConfirm")}
        </H3>
      );
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
          buttonType="light"
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
            buttonType="light"
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
        const onPress = () => this.setPin(pin);
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
              onPress={() => this.onPinReset()}
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
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("onboarding.tos.headerTitle")}
      >
        {this.renderContent(pinState)}
        {pinState.state !== "PinUnselected" && this.renderFooter(pinState)}

        {this.state.showAbortOnboardingModal && (
          <AbortOnboardingModal
            onClose={this.handleModalClose}
            onConfirm={this.handleModalConfirm}
          />
        )}
      </BaseScreenComponent>
    );
  }

  private setPin = (pin: PinString) => {
    this.setState({
      pinState: {
        state: "PinSaved",
        pin,
        savedPin: pot.noneLoading
      }
    });
    setPin(pin).then(
      _ => {
        this.setState({
          pinState: {
            state: "PinSaved",
            pin,
            savedPin: pot.some(pin)
          }
        });
        this.props.dispatch(createPinSuccess(pin));
      },
      _ =>
        // TODO: show toast
        this.setState({
          pinState: {
            state: "PinSaved",
            pin,
            savedPin: pot.noneError("error")
          }
        })
    );
  };

  private handleGoBack = () =>
    this.setState({ showAbortOnboardingModal: true });

  private handleModalClose = () =>
    this.setState({ showAbortOnboardingModal: false });

  private handleModalConfirm = () => {
    this.handleModalClose();
    this.props.dispatch(abortOnboarding());
  };
}

export default connect()(PinScreen);

import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import Pinpad from "../../components/Pinpad";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import TextWithIcon from "../../components/ui/TextWithIcon";
import I18n from "../../i18n";
import { abortOnboarding } from "../../store/actions/onboarding";
import { createPinSuccess } from "../../store/actions/pinset";
import variables from "../../theme/variables";
import { PinString } from "../../types/PinString";
import { setPin } from "../../utils/keychain";

type Props = NavigationScreenProps & ReturnType<typeof mapDispatchToProps>;

type PinUnselected = {
  state: "PinUnselected";
};

type PinSelected = {
  state: "PinSelected";
  // User selected unlock code
  pin: PinString;
};

type PinConfirmError = {
  state: "PinConfirmError";
  // User confirmed a wrong unlock code
  pin: PinString;
};

type PinConfirmed = {
  state: "PinConfirmed";
  pin: PinString;
};

type PinSaved = {
  state: "PinSaved";
  pin: PinString;
  savedPin: pot.Pot<PinString, string>;
};

type PinState =
  | PinUnselected
  | PinSelected
  | PinConfirmed
  | PinSaved
  | PinConfirmError;

type State = {
  pinState: PinState;
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    lineHeight: 22
  },
  description: { lineHeight: 22 }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.unlockCode.contextualHelpTitle",
  body: "onboarding.unlockCode.contextualHelpContent"
};

/**
 * A screen that allows the user to set the unlock code.
 */
class PinScreen extends React.PureComponent<Props, State> {
  private pinConfirmComponent: Pinpad | null = null;

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
  public onPinFulfill = (code: PinString) =>
    this.setState({
      pinState: {
        state: "PinSelected",
        pin: code
      }
    });

  // Method called when the confirmation CodeInput is valid and cancel button is pressed
  public onPinConfirmRemoveLastDigit = () => {
    if (this.state.pinState.state === "PinConfirmed") {
      const pinState: PinSelected = {
        ...this.state.pinState,
        state: "PinSelected"
      };
      this.setState({
        pinState
      });
    }
  };

  // Method called when the confirmation CodeInput is filled
  public onPinConfirmFulfill = (code: PinString, isValid: boolean) => {
    // If the inserted unlock code do not match we clear the component to let the user retry
    if (!isValid && this.pinConfirmComponent) {
      this.pinConfirmComponent.debounceClear();
      if (
        this.state.pinState.state === "PinSelected" ||
        this.state.pinState.state === "PinConfirmed"
      ) {
        const pinConfirmError: PinConfirmError = {
          ...this.state.pinState,
          state: "PinConfirmError"
        };
        this.setState({
          pinState: pinConfirmError
        });
      }
      return;
    }
    this.setState({
      pinState: {
        state: "PinConfirmed",
        pin: code
      }
    });
  };

  public onPinReset() {
    this.setState({
      pinState: {
        state: "PinUnselected"
      }
    });
  }

  // Render a different header when the user need to confirm the unlock code
  public renderContentHeader(pinState: PinState) {
    return (
      <React.Fragment>
        <Text style={styles.header} alignCenter={true} bold={true} dark={true}>
          {I18n.t(
            pinState.state === "PinUnselected"
              ? "onboarding.unlockCode.contentTitle"
              : "onboarding.unlockCode.contentTitleConfirm"
          )}
        </Text>
        <Text alignCenter={true} dark={true}>
          {I18n.t(
            pinState.state === "PinUnselected"
              ? "onboarding.unlockCode.contentSubtitle"
              : "onboarding.unlockCode.contentTitleConfirmSubtitle"
          )}
        </Text>
      </React.Fragment>
    );
  }

  // Render the unlock code match/doesn't match feedback message
  public renderCodeInputConfirmValidation() {
    if (this.state.pinState.state === "PinConfirmError") {
      return (
        <React.Fragment>
          <View spacer={true} extralarge={true} />
          <TextWithIcon danger={true}>
            <IconFont name="io-close" />
            <Text>{I18n.t("onboarding.unlockCode.confirmInvalid")}</Text>
          </TextWithIcon>
        </React.Fragment>
      );
    }

    return undefined;
  }

  // Render select/confirm Pinpad component
  public renderCodeInput(pinState: PinState) {
    if (pinState.state === "PinUnselected") {
      /**
       * The component that allows the user to SELECT the unlock code.
       */
      return (
        <Pinpad
          inactiveColor={variables.brandLightGray}
          activeColor={variables.contentPrimaryBackground}
          onFulfill={this.onPinFulfill}
          buttonType={"light"}
        />
      );
    } else {

      const codeInsertionStatus = this.state.pinState.state === "PinConfirmError" ? I18n.t("onboarding.unlockCode.confirmInvalid") : undefined
      /**
       * The component that allows the user to CONFIRM the unlock code.
       */
      return (
        <React.Fragment>
          <Pinpad
            inactiveColor={variables.brandLightGray}
            activeColor={variables.contentPrimaryBackground}
            compareWithCode={pinState.pin}
            onFulfill={this.onPinConfirmFulfill}
            ref={pinpad => (this.pinConfirmComponent = pinpad)} // tslint:disable-line no-object-mutation
            buttonType={"light"}
            onDeleteLastDigit={this.onPinConfirmRemoveLastDigit}
            codeInsertionStatus={codeInsertionStatus}
          />
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
        {this.renderDescription()}
      </Content>
    );
  }

  // Render the description for the different states
  public renderDescription() {
    return (
      <Text alignCenter={true} style={styles.description}>
        {I18n.t("onboarding.unlockCode.pinInfo")}
      </Text>
    );
  }

  public renderContinueButton(pinState: PinState) {
    if (pinState.state !== "PinConfirmed") {
      return undefined;
    }

    return (
      <React.Fragment>
        <ButtonDefaultOpacity
          block={true}
          primary={true}
          disabled={false}
          onPress={() => this.setPin(pinState.pin)}
        >
          <Text>{I18n.t("global.buttons.continue")}</Text>
        </ButtonDefaultOpacity>
        <View spacer={true} />
      </React.Fragment>
    );
  }

  // The Footer of the Screen
  public renderFooter(pinState: PinState) {
    return (
      <View footer={true}>
        {this.renderContinueButton(pinState)}

        {pinState.state !== "PinUnselected" && (
          <React.Fragment>
            <ButtonDefaultOpacity
              block={true}
              bordered={true}
              onPress={() => this.onPinReset()}
              // small={true} TODO: it should be height 40 and text 16 - conflict with message cta style
            >
              <Text>{I18n.t("onboarding.unlockCode.reset")}</Text>
            </ButtonDefaultOpacity>
          </React.Fragment>
        )}
      </View>
    );
  }

  private handleGoBack = () =>
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: this.props.abortOnboarding
        }
      ]
    );

  public render() {
    const { pinState } = this.state;

    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["onboarding_pin", "unlock"]}
        headerTitle={I18n.t("onboarding.tos.headerTitle")}
      >
        {this.renderContent(pinState)}
        {pinState.state !== "PinUnselected" && this.renderFooter(pinState)}
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
        this.props.createPinSuccess(pin);
      },
      _ =>
        // TODO: show toast if error (https://www.pivotaltracker.com/story/show/170819508)
        this.setState({
          pinState: {
            state: "PinSaved",
            pin,
            savedPin: pot.noneError("error")
          }
        })
    );
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createPinSuccess: (pin: PinString) => dispatch(createPinSuccess(pin)),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(
  undefined,
  mapDispatchToProps
)(PinScreen);

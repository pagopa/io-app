import { Button, H2, Text, View } from "native-base";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import CiePinpad from "../../components/CiePinpad";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";

import { ReduxProps } from "../../store/actions/types";
import variables from "../../theme/variables";
import { PinString } from "../../types/PinString";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps;

type PinUnselected = {
  // Initial state
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
};

type PinState = PinUnselected | PinSelected | PinConfirmed;

type State = {
  pinState: PinState;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

class CiePinScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Initial state with PinUnselected
    this.state = {
      pinState: {
        state: "PinUnselected"
      }
    };
  }

  // Method called when the PIN is filled and cancel button is pressed
  public onPinConfirmRemoveLastDigit = () => {
    console.warn("cancello");
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

  // Method called when the PIN is filled
  public onPinConfirmFulfill = (code: PinString) => {
    this.setState({
      pinState: {
        state: "PinConfirmed",
        pin: code
      }
    });
  };

  // Render a different header when the user need to confirm the PIN
  public renderContentHeader() {
    return (
      <ScreenHeader
        heading={<H2>{I18n.t("authentication.landing.cie.pinCardTitle")}</H2>}
        icon={require("../../../img/icons/icon_insert_cie_pin.png")}
      />
    );
  }

  // Render CiePinpad component
  public renderCodeInput() {
    return (
      <View style={styles.container}>
        <CiePinpad
          description={I18n.t("authentication.landing.cie.pinCardContent")}
          onFulfill={this.onPinConfirmFulfill}
          onDeleteLastDigit={this.onPinConfirmRemoveLastDigit}
        />
      </View>
    );
  }

  // The Content of the Screen
  public renderContent() {
    return (
      <ScrollView>
        {this.renderContentHeader()}
        <View spacer={true} />
        {this.renderCodeInput()}
      </ScrollView>
    );
  }

  public renderContinueButton(pinState: PinState) {
    if (pinState.state !== "PinConfirmed") {
      return;
    }

    const onPress = () => {
      // TODO
      console.warn(pinState.state);
    };

    return (
      <Button block={true} primary={true} onPress={onPress}>
        <Text>{I18n.t("onboarding.pin.continue")}</Text>
      </Button>
    );
  }

  public renderFooter(pinState: PinState) {
    return (
      <View footer={true}>
        {this.renderContinueButton(pinState)}
        <View spacer={true} />
      </View>
    );
  }

  public render() {
    const { pinState } = this.state;

    return (
      <BaseScreenComponent goBack={true}>
        {this.renderContent()}
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "height" : "padding"}
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: variables.contentPadding
          })}
        >
          {pinState.state === "PinConfirmed" &&
            pinState.pin.length === 8 &&
            this.renderFooter(pinState)}
        </KeyboardAvoidingView>
      </BaseScreenComponent>
    );
  }
}

export default CiePinScreen;

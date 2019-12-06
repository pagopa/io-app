/**
 * A screen that allow the user to insert the Cie PIN.
 */

import { Button, H2, Text, View } from "native-base";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import CiePinpad from "../../../components/CiePinpad";
import ScreenHeader from "../../../components/ScreenHeader";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";

import { connect } from "react-redux";
import { navigateToCieRequestAuthenticationScreen } from "../../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import variables from "../../../theme/variables";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = {
  pin: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

const CIE_PIN_LENGTH = 8;

class CiePinScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { pin: "" };
  }

  // Method called when the PIN changes
  public handelOnPinChanged = (pin: string) => {
    this.setState({
      pin
    });
  };

  // Render the header of the CiePinScreen
  // N.B. In this ScreenHeader the heading overlaps the icon, it is solved in https://www.pivotaltracker.com/n/projects/2048617/stories/169674841
  public renderContentHeader() {
    return (
      <ScreenHeader
        heading={<H2>{I18n.t("authentication.landing.cie.pinCardTitle")}</H2>}
        icon={require("../../../../img/icons/icon_insert_cie_pin.png")}
      />
    );
  }

  // Render CiePinpad component
  public renderCodeInput() {
    return (
      <View style={styles.container}>
        <CiePinpad
          pinLength={CIE_PIN_LENGTH}
          description={I18n.t("authentication.landing.cie.pinCardContent")}
          onPinChanged={this.handelOnPinChanged}
          onSubmit={this.handleOnContinuePressButton}
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

  private handleOnContinuePressButton = () => {
    this.props.dispatchNavigationToRequestAutenticationScreen(this.state.pin);
  };

  public renderContinueButton() {
    return (
      <Button
        block={true}
        primary={true}
        onPress={this.handleOnContinuePressButton}
      >
        <Text>{I18n.t("onboarding.pin.continue")}</Text>
      </Button>
    );
  }

  public renderFooter() {
    if (this.state.pin.length !== CIE_PIN_LENGTH) {
      return;
    }
    return (
      <View footer={true}>
        {this.renderContinueButton()}
        <View spacer={true} />
      </View>
    );
  }

  public render() {
    return (
      <BaseScreenComponent goBack={true}>
        {this.renderContent()}
        {this.renderFooter()}
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "height" : "padding"}
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: variables.contentPadding
          })}
        />
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchNavigationToRequestAutenticationScreen: (ciePin: string) =>
    dispatch(navigateToCieRequestAuthenticationScreen({ ciePin }))
});

export default connect(
  null,
  mapDispatchToProps
)(CiePinScreen);

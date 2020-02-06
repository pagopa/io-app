/**
 * A screen that allow the user to insert the Cie PIN.
 */

import { View } from "native-base";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import CiePinpad from "../../../components/CiePinpad";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { navigateToCieRequestAuthenticationScreen } from "../../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import variables from "../../../theme/variables";

type Props = ReduxProps &
  NavigationInjectedProps &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  pin: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: variables.contentPadding
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

  private handleOnContinuePressButton = () => {
    this.props.dispatchNavigationToRequestAutenticationScreen(this.state.pin);
  };

  public render() {
    return (
      <TopScreenComponent
        goBack={true}
        title={I18n.t("authentication.cie.pin.pinCardHeader")}
      >
        <ScrollView>
          <ScreenContentHeader
            title={I18n.t("authentication.cie.pin.pinCardTitle")}
            icon={require("../../../../img/icons/icon_insert_cie_pin.png")}
          />
          <View spacer={true} />
          <View style={styles.container}>
            <CiePinpad
              pinLength={CIE_PIN_LENGTH}
              description={I18n.t("authentication.cie.pin.pinCardContent")}
              onPinChanged={this.handelOnPinChanged}
              onSubmit={this.handleOnContinuePressButton}
            />
          </View>
        </ScrollView>
        {this.state.pin.length === CIE_PIN_LENGTH && (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={{
              primary: true,
              onPress: this.handleOnContinuePressButton,
              title: I18n.t("onboarding.pin.continue")
            }}
          />
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "height" : "padding"}
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: variables.contentPadding
          })}
        />
      </TopScreenComponent>
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

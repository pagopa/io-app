/**
 * A screen that allow the user to insert the Cie PIN.
 */

import { View } from "native-base";
import * as React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import CieRequestAuthenticationOverlay from "../../../components/cie/CieRequestAuthenticationOverlay";
import CiePinpad from "../../../components/CiePinpad";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import {
  BottomTopAnimation,
  LightModalContextInterface
} from "../../../components/ui/LightModal";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { ReduxProps } from "../../../store/actions/types";
import variables from "../../../theme/variables";

type Props = ReduxProps & NavigationInjectedProps & LightModalContextInterface;

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

  private handleOnContitnue = (ciePin: string, authorizationUri: string) => {
    this.props.navigation.navigate({
      routeName: ROUTES.CIE_CARD_READER_SCREEN,
      params: { ciePin, authorizationUri }
    });
    this.props.hideModal();
  };

  private showModal = () => {
    Keyboard.dismiss();

    const component = (
      <CieRequestAuthenticationOverlay
        ciePin={this.state.pin}
        onClose={this.props.hideModal}
        onSuccess={this.handleOnContitnue}
      />
    );
    this.props.showAnimatedModal(component, BottomTopAnimation);
  };

  // Method called when the PIN changes
  public handelOnPinChanged = (pin: string) => {
    this.setState({
      pin
    });
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
              onSubmit={this.showModal}
            />
          </View>
        </ScrollView>
        {this.state.pin.length === CIE_PIN_LENGTH && (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={{
              primary: true,
              onPress: this.showModal,
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

// TODO: sole bug: for a while the pinpad is displayed again when it succeeded
export default withLightModalContext(CiePinScreen);

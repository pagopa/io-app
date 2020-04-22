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
import { connect } from "react-redux";
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
import { nfcIsEnabled } from "../../../store/actions/cie";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import variables from "../../../theme/variables";

type Props = ReduxProps &
  ReturnType<typeof mapDispatchToProps> &
  NavigationInjectedProps &
  LightModalContextInterface;

type State = {
  pin: string;
  url?: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: variables.contentPadding
  }
});

const CIE_PIN_LENGTH = 8;

class CiePinScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { pin: "" };
  }

  private onProceedToCardReaderScreen = (url: string) => {
    this.setState({ url }, () => {
      this.props.hideModal();
    });
  };

  private onHiddenModal = () => {
    const ciePin = this.state.pin;
    this.setState({ pin: "" }, () => {
      this.props.navigation.navigate({
        routeName: ROUTES.CIE_CARD_READER_SCREEN,
        params: { ciePin, authorizationUri: this.state.url }
      });
    });
  };

  private showModal = () => {
    this.props.setOnHiddenModal(this.onHiddenModal);
    this.props.requestNfcEnabledCheck();
    Keyboard.dismiss();

    const component = (
      <CieRequestAuthenticationOverlay
        ciePin={this.state.pin}
        onClose={this.props.hideModal}
        onSuccess={this.onProceedToCardReaderScreen}
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

  private handleOnContinue = () => {
    this.showModal();
  };

  public render() {
    return (
      <TopScreenComponent
        goBack={true}
        headerTitle={I18n.t("authentication.cie.pin.pinCardHeader")}
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
              onSubmit={this.handleOnContinue}
            />
          </View>
        </ScrollView>
        {this.state.pin.length === CIE_PIN_LENGTH && (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={{
              primary: true,
              onPress: this.handleOnContinue,
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
  requestNfcEnabledCheck: () => dispatch(nfcIsEnabled.request())
});

// TODO: solve bug: for a while the pinpad is displayed again when it succeeded - it occurs also during payments after a loading
export default connect(
  null,
  mapDispatchToProps
)(withLightModalContext(CiePinScreen));

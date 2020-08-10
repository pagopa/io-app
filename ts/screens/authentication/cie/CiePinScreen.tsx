import { Millisecond } from "italia-ts-commons/lib/units";
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
import { setAccessibilityFocus } from "../../../utils/accessibility";
import AdviceComponent from "../../../components/AdviceComponent";

type Props = ReduxProps &
  ReturnType<typeof mapDispatchToProps> &
  NavigationInjectedProps &
  LightModalContextInterface;

type State = Readonly<{
  pin: string;
  url?: string;
}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: variables.contentPadding
  }
});

const CIE_PIN_LENGTH = 8;

/**
 * A screen that allow the user to insert the Cie PIN.
 */
class CiePinScreen extends React.PureComponent<Props, State> {
  private continueButtonRef = React.createRef<FooterWithButtons>();
  private pinPadViewRef = React.createRef<View>();
  constructor(props: Props) {
    super(props);
    this.state = { pin: "" };
  }

  private onProceedToCardReaderScreen = (url: string) => {
    const ciePin = this.state.pin;
    this.setState({ url, pin: "" }, () => {
      this.props.navigation.navigate({
        routeName: ROUTES.CIE_CARD_READER_SCREEN,
        params: { ciePin, authorizationUri: url }
      });
      this.props.hideModal();
    });
  };

  private handleAuthenticationOverlayOnClose = () => {
    // reset the pin if user abort process during loading
    this.setState({ pin: "" }, this.props.hideModal);
  };

  private showModal = () => {
    this.props.requestNfcEnabledCheck();
    Keyboard.dismiss();
    const component = (
      <CieRequestAuthenticationOverlay
        onClose={this.handleAuthenticationOverlayOnClose}
        onSuccess={this.onProceedToCardReaderScreen}
      />
    );
    this.props.showAnimatedModal(component, BottomTopAnimation);
  };

  // Method called when the PIN changes
  public handelOnPinChanged = (pin: string) => {
    this.setState(
      {
        pin
      },
      () => {
        // set focus on continue button when the pin input is full filled
        if (this.state.pin.length === CIE_PIN_LENGTH) {
          setAccessibilityFocus(this.continueButtonRef, 100 as Millisecond);
        }
      }
    );
  };

  public render() {
    return (
      <TopScreenComponent
        onAccessibilityNavigationHeaderFocus={() => {
          setAccessibilityFocus(this.pinPadViewRef, 100 as Millisecond);
        }}
        goBack={true}
        headerTitle={I18n.t("authentication.cie.pin.pinCardHeader")}
      >
        <ScrollView>
          <ScreenContentHeader
            title={I18n.t("authentication.cie.pin.pinCardTitle")}
            icon={require("../../../../img/icons/icon_insert_cie_pin.png")}
          />
          <View spacer={true} />
          <View
            style={styles.container}
            accessible={true}
            ref={this.pinPadViewRef}
          >
            <CiePinpad
              pin={this.state.pin}
              pinLength={CIE_PIN_LENGTH}
              description={I18n.t("authentication.cie.pin.pinCardContent")}
              onPinChanged={this.handelOnPinChanged}
              onSubmit={this.showModal}
            />
            <View spacer={true} />
            <AdviceComponent
              adviceMessage={I18n.t("login.expiration_info")}
              adviceIconColor={"black"}
            />
          </View>
        </ScrollView>
        {this.state.pin.length === CIE_PIN_LENGTH && (
          <FooterWithButtons
            accessible={true}
            ref={this.continueButtonRef}
            type={"SingleButton"}
            leftButton={{
              primary: true,
              onPress: this.showModal,
              title: I18n.t("global.buttons.continue")
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

/**
 * A screen that allow the user to insert the Cie PIN.
 */
import { Content, Text, View } from "native-base";
import * as React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import CieRequestAuthenticationOverlay from "../../../components/cie/CieRequestAuthenticationOverlay";
import CiePinpad from "../../../components/CiePinpad";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
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

type State = Readonly<{
  pin: string;
  url?: string;
}>;

const CIE_PIN_LENGTH = 8;

const styles = StyleSheet.create({
  reducedHeight: {
    lineHeight: 21
  }
});

class CiePinScreen extends React.PureComponent<Props, State> {
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

  // THe modal content send a request to Viminale backend and returns the url 
  // required to complete the authentication once the CIE card is properly read
  private showModal = () => {
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
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("authentication.cie.pin.header")}
      >
        <Content>
          <ScreenContentHeader
            padded={false}
            title={I18n.t("authentication.cie.pin.title")}
          />
          <View spacer={true} />
          <CiePinpad
            pin={this.state.pin}
            pinLength={CIE_PIN_LENGTH}
            onPinChanged={this.handelOnPinChanged}
            onSubmit={this.handleOnContinue}
          />
          <Text style={styles.reducedHeight}>
            <Text bold={true}>
              {I18n.t("authentication.cie.pin.description.block1")}
            </Text>
            <Text>{`\n${I18n.t(
              "authentication.cie.pin.description.block2"
            )}`}</Text>
            <Text>{`\n${I18n.t(
              "authentication.cie.pin.description.block3"
            )}`}</Text>
            <Text>{`\n${I18n.t(
              "authentication.cie.pin.description.block4"
            )}`}</Text>
          </Text>
        </Content>
        {this.state.pin.length === CIE_PIN_LENGTH && (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={{
              primary: true,
              onPress: this.handleOnContinue,
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
      </BaseScreenComponent>
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

import { Content, Text } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { BiometrySimpleType } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import {
  abortOnboarding,
  fingerprintAcknowledge
} from "../../store/actions/onboarding";
import { Dispatch } from "../../store/actions/types";

type NavigationParams = Readonly<{
  biometryType: BiometrySimpleType;
}>;

export type BiometryPrintableSimpleType =
  | "FINGERPRINT"
  | "TOUCH_ID"
  | "FACE_ID";

type Props = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapDispatchToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.contextualHelpTitle",
  body: "onboarding.contextualHelpContent"
};

/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
class FingerprintScreen extends React.PureComponent<Props> {
  /**
   * Print the only BiometrySimplePrintableType values that are passed to the UI
   * @param biometrySimplePrintableType
   */
  private renderBiometryType(
    biometryPrintableSimpleType: BiometryPrintableSimpleType
  ): string {
    switch (biometryPrintableSimpleType) {
      case "FINGERPRINT":
        return I18n.t("onboarding.fingerprint.body.enrolledType.fingerprint");
      case "FACE_ID":
        return I18n.t("onboarding.fingerprint.body.enrolledType.faceId");
      case "TOUCH_ID":
        return I18n.t("onboarding.fingerprint.body.enrolledType.touchId");
    }
  }

  /**
   * Print the icon according to current biometry status
   * @param biometrySimplePrintableType
   */
  private getBiometryIconName(biometryType: BiometrySimpleType) {
    switch (biometryType) {
      case "FACE_ID":
        return "io-face-id";
      case "FINGERPRINT":
      case "TOUCH_ID":
      case "NOT_ENROLLED":
      case "UNAVAILABLE":
        return "io-fingerprint";
    }
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
    const biometryType = this.props.navigation.getParam("biometryType");

    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("onboarding.fingerprint.headerTitle")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["onboarding_fingerprint"]}
      >
        <ScreenContentHeader
          title={I18n.t("onboarding.fingerprint.title")}
          iconFont={{ name: this.getBiometryIconName(biometryType) }}
        />
        <Content>
          <Text>
            {biometryType !== "NOT_ENROLLED"
              ? I18n.t("onboarding.fingerprint.body.enrolledText", {
                  biometryType: this.renderBiometryType(
                    biometryType as BiometryPrintableSimpleType
                  )
                })
              : I18n.t("onboarding.fingerprint.body.notEnrolledText")}
          </Text>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            title: I18n.t("global.buttons.continue"),
            primary: true,
            onPress: this.props.fingerprintAcknowledgeRequest
          }}
        />
      </TopScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fingerprintAcknowledgeRequest: () =>
    dispatch(fingerprintAcknowledge.request()),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(undefined, mapDispatchToProps)(FingerprintScreen);

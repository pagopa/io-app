import { Content } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";
import { Body } from "../../components/core/typography/Body";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { OnboardingParamsList } from "../../navigation/params/OnboardingParamsList";
import {
  abortOnboarding,
  fingerprintAcknowledge
} from "../../store/actions/onboarding";
import { Dispatch } from "../../store/actions/types";
import { BiometricsValidType } from "../../utils/biometrics";

export type FingerprintScreenNavigationParams = Readonly<{
  biometryType: BiometricsValidType;
}>;

/**
 * Print the only BiometrySimplePrintableType values that are passed to the UI
 */
function localizeBiometricsType(
  biometryPrintableSimpleType: BiometricsValidType
): string {
  switch (biometryPrintableSimpleType) {
    case "BIOMETRICS":
      return I18n.t("onboarding.fingerprint.body.enrolledType.fingerprint");
    case "FACE_ID":
      return I18n.t("onboarding.fingerprint.body.enrolledType.faceId");
    case "TOUCH_ID":
      return I18n.t("onboarding.fingerprint.body.enrolledType.touchId");
  }
}

/**
 * Print the icon according to current biometry status
 */
function getBiometryIconName(biometryType: BiometricsValidType): string {
  switch (biometryType) {
    case "FACE_ID":
      return "io-face-id";
    case "BIOMETRICS":
    case "TOUCH_ID":
      return "io-fingerprint";
  }
}

type Props = IOStackNavigationRouteProps<
  OnboardingParamsList,
  "ONBOARDING_FINGERPRINT"
> &
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
    const biometryType = this.props.route.params.biometryType;

    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("onboarding.fingerprint.headerTitle")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["onboarding_fingerprint"]}
      >
        <ScreenContentHeader
          title={I18n.t("onboarding.fingerprint.title")}
          iconFont={{ name: getBiometryIconName(biometryType) }}
        />
        <Content>
          <Body>
            {I18n.t("onboarding.fingerprint.body.enrolledText", {
              biometryType: localizeBiometricsType(biometryType)
            })}
          </Body>
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

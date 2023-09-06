import * as React from "react";
import { Alert, ScrollView, View } from "react-native";
import { connect } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOIcons, VSpacer } from "@pagopa/io-app-design-system";
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
import { IOVisualCostants } from "../../components/core/variables/IOStyles";

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
function getBiometryIconName(biometryType: BiometricsValidType): IOIcons {
  switch (biometryType) {
    case "FACE_ID":
      return "biomFaceID";
    case "BIOMETRICS":
    case "TOUCH_ID":
      return "biomFingerprint";
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
const FingerprintScreen = ({
  fingerprintAcknowledgeRequest,
  abortOnboarding,
  route
}: Props) => {
  const insets = useSafeAreaInsets();

  const biometryType = route.params.biometryType;

  const handleGoBack = () =>
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
          onPress: abortOnboarding
        }
      ]
    );

  return (
    <TopScreenComponent
      goBack={handleGoBack}
      headerTitle={I18n.t("onboarding.fingerprint.headerTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["onboarding_fingerprint"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: IOVisualCostants.appMarginDefault
        }}
      >
        <ScreenContentHeader
          title={I18n.t("onboarding.fingerprint.title")}
          icon={getBiometryIconName(biometryType)}
        />
        <VSpacer size={24} />
        <View
          style={{
            flexGrow: 1,
            paddingHorizontal: IOVisualCostants.appMarginDefault
          }}
        >
          <Body>
            {I18n.t("onboarding.fingerprint.body.enrolledText", {
              biometryType: localizeBiometricsType(biometryType)
            })}
          </Body>
        </View>
      </ScrollView>
      {/* Waiting for a component that makes this wrapper
      useless. FooterWithButtons currently uses
      NativeBase buttons, instead of new ones */}
      <View style={{ paddingBottom: insets.bottom }}>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            title: I18n.t("global.buttons.continue"),
            primary: true,
            onPress: fingerprintAcknowledgeRequest
          }}
        />
      </View>
    </TopScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fingerprintAcknowledgeRequest: () =>
    dispatch(fingerprintAcknowledge.request()),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(undefined, mapDispatchToProps)(FingerprintScreen);

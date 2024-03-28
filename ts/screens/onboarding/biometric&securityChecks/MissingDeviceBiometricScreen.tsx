import {
  FooterWithButtons,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, ScrollView, View } from "react-native";
import { useDispatch } from "react-redux";
import { Body } from "../../../components/core/typography/Body";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import I18n from "../../../i18n";
import { abortOnboarding } from "../../../store/actions/onboarding";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../store/actions/persistedPreferences";
import { useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { trackBiometricConfigurationEducationalScreen } from "./analytics";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.contextualHelpTitle",
  body: "onboarding.contextualHelpContent"
};

/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const MissingDeviceBiometricScreen = () => {
  const dispatch = useDispatch();

  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  useOnFirstRender(() => {
    trackBiometricConfigurationEducationalScreen(
      getFlowType(true, isFirstOnBoarding)
    );
  });

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
          onPress: () => dispatch(abortOnboarding())
        }
      ]
    );

  return (
    <TopScreenComponent
      goBack={handleGoBack}
      headerTitle={I18n.t("onboarding.biometric.headerTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["onboarding_fingerprint"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: IOVisualCostants.appMarginDefault
        }}
      >
        <ScreenContentHeader
          title={I18n.t("onboarding.biometric.available.title")}
        />
        <VSpacer size={24} />
        <View
          style={{
            flexGrow: 1,
            paddingHorizontal: IOVisualCostants.appMarginDefault
          }}
        >
          <Body>
            {I18n.t("onboarding.biometric.available.body.infoStart") + " "}
            <Body weight="SemiBold">
              {I18n.t("onboarding.biometric.available.body.biometricType") +
                " "}
            </Body>
            <Body>{I18n.t("onboarding.biometric.available.body.infoEnd")}</Body>
          </Body>
          <VSpacer size={24} />
          <Body>
            {I18n.t("onboarding.biometric.available.body.notEnrolled.text")}
          </Body>
        </View>
      </ScrollView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: () =>
              dispatch(
                preferenceFingerprintIsEnabledSaveSuccess({
                  isFingerprintEnabled: false
                })
              ),
            testID: "not-enrolled-biometric-confirm"
          }
        }}
      />
    </TopScreenComponent>
  );
};

export default MissingDeviceBiometricScreen;

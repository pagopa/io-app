import * as React from "react";
import { Alert, ScrollView, View } from "react-native";
import { useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOVisualCostants, VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { abortOnboarding } from "../../../store/actions/onboarding";
import { InfoBox } from "../../../components/box/InfoBox";
import { H5 } from "../../../components/core/typography/H5";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../store/actions/persistedPreferences";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { getFlowType } from "../../../utils/analytics";
import {
  BiometriActivationUserType,
  mayUserActivateBiometric
} from "../../../utils/biometrics";
import {
  trackBiometricActivationAccepted,
  trackBiometricActivationDeclined,
  trackBiometricActivationEducationalScreen
} from "./analytics";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.contextualHelpTitle",
  body: "onboarding.contextualHelpContent"
};

/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const FingerprintScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  useOnFirstRender(() => {
    trackBiometricActivationEducationalScreen(
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
            {I18n.t("onboarding.biometric.available.body.enrolledText")}
          </Body>
          <VSpacer size={48} />
          <InfoBox iconName="navProfile" iconColor="bluegrey">
            <H5 color={"bluegrey"} weight={"Regular"}>
              {I18n.t("onboarding.biometric.available.settings")}
            </H5>
          </InfoBox>
        </View>
      </ScrollView>
      {/* Waiting for a component that makes this wrapper
      useless. FooterWithButtons currently uses
      NativeBase buttons, instead of new ones */}
      <View style={{ paddingBottom: insets.bottom }}>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            title: I18n.t("global.buttons.notNow"),
            bordered: true,
            onPress: () => {
              trackBiometricActivationDeclined(
                getFlowType(true, isFirstOnBoarding)
              );
              dispatch(
                preferenceFingerprintIsEnabledSaveSuccess({
                  isFingerprintEnabled: false
                })
              );
            }
          }}
          rightButton={{
            title: I18n.t("global.buttons.activate2"),
            onPress: () =>
              mayUserActivateBiometric()
                .then(_ => {
                  trackBiometricActivationAccepted(
                    getFlowType(true, isFirstOnBoarding)
                  );

                  dispatch(
                    preferenceFingerprintIsEnabledSaveSuccess({
                      isFingerprintEnabled: true
                    })
                  );
                })
                .catch((err: BiometriActivationUserType) => {
                  if (err === "PERMISSION_DENIED") {
                    trackBiometricActivationDeclined(
                      getFlowType(true, isFirstOnBoarding)
                    );
                    dispatch(
                      preferenceFingerprintIsEnabledSaveSuccess({
                        isFingerprintEnabled: false
                      })
                    );
                  }
                })
          }}
        />
      </View>
    </TopScreenComponent>
  );
};

export default FingerprintScreen;

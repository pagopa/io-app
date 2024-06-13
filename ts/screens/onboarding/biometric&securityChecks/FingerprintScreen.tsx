import { Banner, H2, VSpacer } from "@pagopa/io-app-design-system";
import React, { ComponentProps, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { abortOnboarding } from "../../../store/actions/onboarding";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { getFlowType } from "../../../utils/analytics";
import {
  BiometriActivationUserType,
  mayUserActivateBiometric
} from "../../../utils/biometrics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { FAQsCategoriesType } from "../../../utils/faq";
import { IOScrollView } from "../../../components/ui/IOScrollView";
import {
  trackBiometricActivationAccepted,
  trackBiometricActivationDeclined,
  trackBiometricActivationEducationalScreen
} from "./analytics";

type IOScrollViewActions = ComponentProps<typeof IOScrollView>["actions"];

const FAQ_CATEGORIES: ReadonlyArray<FAQsCategoriesType> = [
  "onboarding_fingerprint"
];

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.contextualHelpTitle",
  body: "onboarding.contextualHelpContent"
};

/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const FingerprintScreen = () => {
  const dispatch = useIODispatch();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  useOnFirstRender(() => {
    trackBiometricActivationEducationalScreen(
      getFlowType(true, isFirstOnBoarding)
    );
  });

  const handleGoBack = useCallback(
    () =>
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
      ),
    [dispatch]
  );

  useHeaderSecondLevel({
    goBack: handleGoBack,
    title: "",
    faqCategories: FAQ_CATEGORIES,
    supportRequest: true,
    contextualHelpMarkdown
  });

  const actions = useMemo<IOScrollViewActions>(
    () => ({
      type: "TwoButtons",
      primary: {
        label: I18n.t("global.buttons.activate2"),
        accessibilityLabel: I18n.t("global.buttons.activate2"),
        onPress: () => {
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
            });
        }
      },
      secondary: {
        label: I18n.t("global.buttons.notNow"),
        accessibilityLabel: I18n.t("global.buttons.notNow"),
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
      }
    }),
    [dispatch, isFirstOnBoarding]
  );

  return (
    <IOScrollView actions={actions}>
      <H2>{I18n.t("onboarding.biometric.available.title")}</H2>
      <VSpacer size={16} />
      <Body>{I18n.t("onboarding.biometric.available.body.text")}</Body>
      <VSpacer size={24} />
      <Banner
        content={I18n.t("onboarding.biometric.available.settings")}
        color="neutral"
        size="small"
        pictogramName="activate"
      />
    </IOScrollView>
  );
};

export default FingerprintScreen;

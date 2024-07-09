import { ListItemInfo } from "@pagopa/io-app-design-system";
import React, { useMemo } from "react";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { FAQsCategoriesType } from "../../../utils/faq";
import ScreenWithListItems from "../../../components/screens/ScreenWithListItems";
import { useOnboardingAbortAlert } from "../../../utils/hooks/useOnboardingAbortAlert";
import useContentWithFF from "../../profile/useContentWithFF";
import { trackBiometricConfigurationEducationalScreen } from "./analytics";

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
const MissingDeviceBiometricScreen = () => {
  const dispatch = useIODispatch();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const { showAlert } = useOnboardingAbortAlert();

  useOnFirstRender(() => {
    trackBiometricConfigurationEducationalScreen(
      getFlowType(true, isFirstOnBoarding)
    );
  });

  useHeaderSecondLevel({
    goBack: showAlert,
    title: "",
    faqCategories: FAQ_CATEGORIES,
    supportRequest: true,
    contextualHelpMarkdown
  });
  const content = useContentWithFF(
    "onboarding.biometric.available.body.notEnrolled.step3.value"
  );

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: I18n.t(
          "onboarding.biometric.available.body.notEnrolled.step1.label"
        ),
        value: I18n.t(
          "onboarding.biometric.available.body.notEnrolled.step1.value"
        ),
        icon: "systemSettingsAndroid"
      },
      {
        label: I18n.t(
          "onboarding.biometric.available.body.notEnrolled.step2.label"
        ),
        value: I18n.t(
          "onboarding.biometric.available.body.notEnrolled.step2.value"
        ),
        icon: "systemBiometricRecognitionOS"
      },
      {
        label: I18n.t(
          "onboarding.biometric.available.body.notEnrolled.step3.label"
        ),
        value: content,
        icon: "systemToggleInstructions"
      }
    ],
    [content]
  );

  const primaryActionProps = useMemo(
    () => ({
      label: I18n.t("global.buttons.continue"),
      accessibilityLabel: I18n.t("global.buttons.continue"),
      onPress: () => {
        dispatch(
          preferenceFingerprintIsEnabledSaveSuccess({
            isFingerprintEnabled: false
          })
        );
      },
      testID: "not-enrolled-biometric-confirm"
    }),
    [dispatch]
  );

  return (
    <ScreenWithListItems
      title={I18n.t("onboarding.biometric.available.title")}
      subtitle={`${I18n.t(
        "onboarding.biometric.available.body.text"
      )}\n\n${I18n.t("onboarding.biometric.available.body.notEnrolled.text")}`}
      listItemHeaderLabel={I18n.t(
        "onboarding.biometric.available.body.notEnrolled.label"
      )}
      renderItems={listItems}
      primaryActionProps={primaryActionProps}
    />
  );
};

export default MissingDeviceBiometricScreen;

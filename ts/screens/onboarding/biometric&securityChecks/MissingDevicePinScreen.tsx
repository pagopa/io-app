import { ListItemInfo } from "@pagopa/io-app-design-system";
import React, { useMemo } from "react";
import { Platform } from "react-native";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { getFlowType } from "../../../utils/analytics";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { useOnboardingAbortAlert } from "../../../utils/hooks/useOnboardingAbortAlert";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { FAQsCategoriesType } from "../../../utils/faq";
import ScreenWithListItems from "../../../components/screens/ScreenWithListItems";
import { isSettingsVisibleAndHideProfileSelector } from "../../../store/reducers/backendStatus";
import { trackPinEducationalScreen } from "./analytics";

const FAQ_CATEGORIES: ReadonlyArray<FAQsCategoriesType> = [
  "onboarding_fingerprint"
];

/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const MissingDevicePinScreen = () => {
  const dispatch = useIODispatch();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const { showAlert } = useOnboardingAbortAlert();
  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

  const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
    title: "onboarding.contextualHelpTitle",
    body: isSettingsVisibleAndHideProfile
      ? "onboarding.contextualHelpContent"
      : "onboarding.legacyContextualHelpContent"
  };

  useOnFirstRender(() => {
    trackPinEducationalScreen(getFlowType(true, isFirstOnBoarding));
  });

  useHeaderSecondLevel({
    title: "",
    contextualHelpMarkdown,
    faqCategories: FAQ_CATEGORIES,
    goBack: showAlert,
    supportRequest: true
  });

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: I18n.t("onboarding.biometric.unavailable.body.step1.label"),
        value: I18n.t("onboarding.biometric.unavailable.body.step1.value"),
        icon: "systemSettingsAndroid"
      },
      {
        label: I18n.t("onboarding.biometric.unavailable.body.step2.label"),
        value: I18n.t("onboarding.biometric.unavailable.body.step2.value"),
        icon: Platform.select({
          ios: "systemPasswordiOS",
          android: "systemPasswordAndroid"
        })
      }
    ],
    []
  );

  const actionProps = useMemo(
    () => ({
      label: I18n.t("global.buttons.continue"),
      accessibilityLabel: I18n.t("global.buttons.continue"),
      onPress: () =>
        dispatch(
          preferenceFingerprintIsEnabledSaveSuccess({
            isFingerprintEnabled: false
          })
        )
    }),
    [dispatch]
  );

  return (
    <ScreenWithListItems
      title={I18n.t("onboarding.biometric.unavailable.title")}
      subtitle={I18n.t("onboarding.biometric.unavailable.subtitle")}
      listItemHeaderLabel={I18n.t(
        "onboarding.biometric.unavailable.body.label"
      )}
      renderItems={listItems}
      primaryActionProps={actionProps}
    />
  );
};

export default MissingDevicePinScreen;

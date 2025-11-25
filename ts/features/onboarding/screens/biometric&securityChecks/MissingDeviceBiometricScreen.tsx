import { ListItemInfo } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useMemo } from "react";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithListItems } from "../../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { getFlowType } from "../../../../utils/analytics";
import { FAQsCategoriesType } from "../../../../utils/faq";
import { ContextualHelpPropsMarkdown } from "../../../../utils/help";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { isProfileFirstOnBoardingSelector } from "../../../settings/common/store/selectors";
import { useOnboardingAbortAlert } from "../../hooks/useOnboardingAbortAlert";
import { trackBiometricConfigurationEducationalScreen } from "./analytics";

const FAQ_CATEGORIES: ReadonlyArray<FAQsCategoriesType> = [
  "onboarding_fingerprint"
];

/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const MissingDeviceBiometricScreen = () => {
  const dispatch = useIODispatch();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);
  const { showAlert } = useOnboardingAbortAlert();

  const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
    title: "onboarding.contextualHelpTitle",
    body: "onboarding.contextualHelpContent"
  };

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
        value: I18n.t(
          "onboarding.biometric.available.body.notEnrolled.step3.value"
        ),
        icon: "systemToggleInstructions"
      }
    ],
    []
  );

  const actions: IOScrollViewActions = {
    type: "SingleButton",
    primary: {
      label: I18n.t("global.buttons.continue"),
      testID: "not-enrolled-biometric-confirm",
      onPress: () => {
        dispatch(
          preferenceFingerprintIsEnabledSaveSuccess({
            isFingerprintEnabled: false
          })
        );
      }
    }
  };

  return (
    <IOScrollViewWithListItems
      title={I18n.t("onboarding.biometric.available.title")}
      subtitle={`${I18n.t(
        "onboarding.biometric.available.body.text"
      )}\n\n${I18n.t("onboarding.biometric.available.body.notEnrolled.text")}`}
      listItemHeaderLabel={I18n.t(
        "onboarding.biometric.available.body.notEnrolled.label"
      )}
      renderItems={listItems}
      actions={actions}
    />
  );
};

export default MissingDeviceBiometricScreen;

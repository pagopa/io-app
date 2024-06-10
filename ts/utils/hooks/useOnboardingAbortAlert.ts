import { Alert } from "react-native";
import { useCallback } from "react";
import I18n from "../../i18n";
import { abortOnboarding } from "../../store/actions/onboarding";
import { useIODispatch } from "../../store/hooks";

type OnboardingAbortAlertUtils = {
  showAlert: () => void;
};

/**
 * Return an object used to manage an alert
 * that will trigger the `abortOnboarding` action.
 */
export const useOnboardingAbortAlert = (): OnboardingAbortAlertUtils => {
  const dispatch = useIODispatch();

  const showAlert = useCallback(() => {
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
          onPress: () => {
            dispatch(abortOnboarding());
          }
        }
      ]
    );
  }, [dispatch]);

  return { showAlert };
};

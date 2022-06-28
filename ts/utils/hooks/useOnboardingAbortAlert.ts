import { useDispatch } from "react-redux";
import { Alert } from "react-native";
import { abortOnboarding } from "../../store/actions/onboarding";
import I18n from "../../i18n";

type OnboardingAbortAlertUtils = {
  showAlert: () => void;
};

/**
 * Return an object used to manage an alert
 * that will trigger the `abortOnboarding` action.
 */
export const useOnboardingAbortAlert = (): OnboardingAbortAlertUtils => {
  const dispatch = useDispatch();

  const executeAbortOnboarding = () => {
    dispatch(abortOnboarding());
  };

  const showAlert = () => {
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
          onPress: executeAbortOnboarding
        }
      ]
    );
  };

  return { showAlert };
};

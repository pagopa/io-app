import { Alert } from "react-native";
import { useCallback } from "react";
import I18n from "i18next";
import { abortOnboarding } from "../store/actions";
import { useIODispatch } from "../../../store/hooks";

type OnboardingAbortAlertUtils = {
  showAlert: (callback?: () => void) => void;
};

/**
 * Return an object used to manage an alert
 * that will trigger the `abortOnboarding` action.
 */
export const useOnboardingAbortAlert = (): OnboardingAbortAlertUtils => {
  const dispatch = useIODispatch();

  const showAlert = useCallback(
    (callback?: () => void) => {
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
              // If a callback is provided, we want to handle the logic in the callback
              // otherwise we want to automatically dispatch the abortOnboarding action
              if (callback && typeof callback === "function") {
                callback();
              } else {
                dispatch(abortOnboarding());
              }
            }
          }
        ]
      );
    },
    [dispatch]
  );

  return { showAlert };
};

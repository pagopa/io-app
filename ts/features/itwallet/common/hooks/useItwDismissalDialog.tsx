import { Alert } from "react-native";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

/**
 * Allows to show a dismissal dialog in which the user must confirm the desire to close the current flow.
 * This hook also handles the hardware back button to show the dialog when the user presses the back button.
 * @param handleDismiss - An optionalfunction that will be called when the user confirms the dismissal.
 * @returns a function that can be used to show the dialog
 */
export const useItwDismissalDialog = (handleDismiss?: () => void) => {
  const navigation = useIONavigation();

  const show = () =>
    Alert.alert(
      I18n.t("features.itWallet.generic.alert.title"),
      I18n.t("features.itWallet.generic.alert.body"),
      [
        {
          text: I18n.t("features.itWallet.generic.alert.confirm"),
          style: "destructive",
          onPress: handleDismiss || navigation.goBack
        },
        {
          text: I18n.t("features.itWallet.generic.alert.cancel"),
          style: "cancel"
        }
      ]
    );

  useHardwareBackButton(() => {
    show();
    return true;
  });

  return { show };
};

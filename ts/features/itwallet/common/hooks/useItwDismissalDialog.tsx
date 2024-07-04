import { Alert } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";

/**
 * Allows to show a dismissal dialog in which the user must confirm the desire to close the current flow
 * @returns a function that show the dialog
 */
export const useItwDismissalDialog = () => {
  const navigation = useIONavigation();

  const handleDismiss = () => {
    navigation.popToTop();
  };

  const show = () =>
    Alert.alert(I18n.t("features.itWallet.generic.alert.title"), undefined, [
      {
        text: I18n.t("features.itWallet.generic.alert.confirm"),
        style: "destructive",
        onPress: handleDismiss
      },
      {
        text: I18n.t("features.itWallet.generic.alert.cancel"),
        style: "cancel"
      }
    ]);

  return { show };
};

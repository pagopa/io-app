import { Alert } from "react-native";
import I18n from "../../../i18n";

/**
 * Credetes a cancel action confirmation alert.
 * @param onPress - the callback to be called when the user confirms the action
 */
export const itwShowCancelAlert = (onPress: () => void) => {
  Alert.alert(I18n.t("features.itWallet.generic.alert.title"), undefined, [
    {
      text: I18n.t("features.itWallet.generic.alert.cancel"),
      style: "cancel"
    },
    {
      text: I18n.t("features.itWallet.generic.alert.confirm"),
      onPress
    }
  ]);
};

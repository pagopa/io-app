import { Alert } from "react-native";
import I18n from "../../../i18n";

export const showCancelAlert = (onPress: () => void) => {
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

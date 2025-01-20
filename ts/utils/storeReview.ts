import { Alert } from "react-native";
import * as StoreReview from "react-native-store-review";
import I18n from "../i18n";
import { openWebUrl } from "./url";

export const requestAppReview = () => {
  Alert.alert(
    I18n.t("appFeedback.alert.title"),
    I18n.t("appFeedback.alert.description"),
    [
      {
        text: I18n.t("appFeedback.alert.continue"),
        style: "default",
        onPress: () => StoreReview.requestReview()
      },
      {
        text: I18n.t("appFeedback.alert.discard"),
        style: "cancel",
        onPress: () => {
          // TODO This is just a temporary placeholder
          // Replace this URL with the appropriate feedback form/SDK call
          openWebUrl(
            "https://pagopa.qualtrics.com/jfe/form/SV_40ije50GQj63CJ0"
          );
        }
      }
    ]
  );
};

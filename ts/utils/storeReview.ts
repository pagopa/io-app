import { Alert } from "react-native";
import * as StoreReview from "react-native-store-review";
import I18n from "../i18n";
import { openWebUrl } from "./url";
import { constVoid } from "fp-ts/lib/function";

export const requestAppReview = (
  isAppFeedbackEnabled: boolean,
  appFeedbackUri?: string
) =>
  isAppFeedbackEnabled
    ? Alert.alert(
        I18n.t("appFeedback.alert.title"),
        I18n.t("appFeedback.alert.description"),
        [
          {
            text: I18n.t("appFeedback.alert.discard"),
            style: "cancel",
            onPress: () => {
              // TODO This is just a temporary placeholder
              // Replace this URL with the appropriate feedback form/SDK call
              if (appFeedbackUri) {
                openWebUrl(appFeedbackUri);
              }
            }
          },
          {
            text: I18n.t("appFeedback.alert.continue"),
            style: "default",
            onPress: () => StoreReview.requestReview()
          }
        ]
      )
    : StoreReview.requestReview();

import { Alert } from "react-native";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  appFeedbackEnabledSelector,
  appFeedbackUriConfigSelector
} from "../../../store/reducers/backendStatus/remoteConfig";
import { requestAppReview } from "../utils/storeReview";
import I18n from "../../../i18n";
import { canAskFeedbackSelector } from "../store/selectors";
import {
  appReviewNegativeFeedback,
  appReviewPositiveFeedback,
  TopicKeys
} from "../store/actions";
import { openWebUrl } from "../../../utils/url";

export const useAppReviewRequest = (topic: TopicKeys = "general") => {
  const dispatch = useIODispatch();

  const appFeedbackEnabled = useIOSelector(appFeedbackEnabledSelector);
  const canAskFeedback = useIOSelector(canAskFeedbackSelector(topic));
  const surveyUrl = useIOSelector(appFeedbackUriConfigSelector(topic));

  return () => {
    if (!canAskFeedback) {
      return;
    }
    if (appFeedbackEnabled) {
      Alert.alert(
        I18n.t("appFeedback.alert.title"),
        I18n.t("appFeedback.alert.description"),
        [
          {
            text: I18n.t("appFeedback.alert.discard"),
            style: "cancel",
            onPress: () => {
              if (surveyUrl) {
                openWebUrl(surveyUrl);
                dispatch(appReviewNegativeFeedback(topic));
              }
            }
          },
          {
            text: I18n.t("appFeedback.alert.continue"),
            style: "default",
            onPress: () => {
              dispatch(appReviewPositiveFeedback());
              requestAppReview();
            }
          }
        ]
      );
      return;
    }
    requestAppReview();
  };
};

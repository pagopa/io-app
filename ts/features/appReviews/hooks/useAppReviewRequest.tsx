import { Alert } from "react-native";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { Body, FooterActions, useIOToast } from "@pagopa/io-app-design-system";
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
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";

export const useAppReviewRequest = (topic: TopicKeys = "general") => {
  const dispatch = useIODispatch();

  const appFeedbackEnabled = useIOSelector(appFeedbackEnabledSelector);
  const canAskFeedback = useIOSelector(canAskFeedbackSelector(topic));

  const { bottomSheet, present } = useAppFeedbackBottomSheet(topic);
  return {
    requestFeedback: () => {
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
                dispatch(appReviewNegativeFeedback(topic));
                present();
              }
            },
            {
              text: I18n.t("appFeedback.alert.continue"),
              style: "default",
              onPress: () => {
                requestAppReview();
                dispatch(appReviewPositiveFeedback());
              }
            }
          ]
        );
      } else {
        requestAppReview();
      }
    },
    appReviewBottomSheet: bottomSheet
  };
};

const useAppFeedbackBottomSheet = (topic: TopicKeys = "general") => {
  const surveyUrl = useIOSelector(appFeedbackUriConfigSelector(topic));
  const { show } = useIOToast();

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t("appFeedback.bottomSheet.title"),
    component: <Body>{I18n.t("appFeedback.bottomSheet.description")}</Body>,
    footer: (
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t("appFeedback.bottomSheet.continue"),
            onPress: () => {
              if (surveyUrl) {
                void openAuthenticationSession(surveyUrl, "");
              }
              dismiss();
            }
          },
          secondary: {
            label: I18n.t("appFeedback.bottomSheet.discard"),
            onPress: () => {
              show(I18n.t("appFeedback.toast.negativeFeedback"));
              dismiss();
            }
          }
        }}
      />
    )
  });

  return { present, dismiss, bottomSheet };
};

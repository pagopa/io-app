import { Body, FooterActions, useIOToast } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";
import {
  appReviewNegativeFeedback,
  appReviewPositiveFeedback,
  TopicKeys
} from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { requestAppReview } from "../utils/storeReview";
import {
  appFeedbackEnabledSelector,
  appFeedbackUriConfigSelector
} from "../../../store/reducers/backendStatus/remoteConfig";
import { canAskFeedbackSelector } from "../store/selectors";

type AppFeedbackContextType = {
  requestFeedback: (topic: TopicKeys) => void;
};

export const AppFeedbackContext = createContext<AppFeedbackContextType>({
  requestFeedback: () => null
});

export const AppFeedbackProvider = ({ children }: PropsWithChildren) => {
  const [topic, setTopic] = useState<TopicKeys | undefined>();
  const dispatch = useIODispatch();
  const { show } = useIOToast();
  const surveyUrl = useIOSelector(appFeedbackUriConfigSelector(topic));
  const appFeedbackEnabled = useIOSelector(appFeedbackEnabledSelector);
  const canAskFeedback = useIOSelector(canAskFeedbackSelector(topic));

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
              setTopic(undefined);
              dismiss();
            }
          },
          secondary: {
            label: I18n.t("appFeedback.bottomSheet.discard"),
            onPress: () => {
              show(I18n.t("appFeedback.toast.negativeFeedback"));
              setTopic(undefined);
              dismiss();
            }
          }
        }}
      />
    )
  });

  useEffect(() => {
    if (topic === undefined || !canAskFeedback) {
      return;
    }
    if (appFeedbackEnabled) {
      Alert.alert(
        I18n.t("appFeedback.alert.title"),
        I18n.t("appFeedback.alert.description"),
        [
          {
            text: I18n.t("appFeedback.alert.discard"),
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
              setTopic(undefined);
              dispatch(appReviewPositiveFeedback());
            }
          }
        ]
      );
    } else {
      requestAppReview();
    }
  }, [appFeedbackEnabled, canAskFeedback, dispatch, present, topic]);

  return (
    <AppFeedbackContext.Provider value={{ requestFeedback: setTopic }}>
      {children}
      {bottomSheet}
    </AppFeedbackContext.Provider>
  );
};

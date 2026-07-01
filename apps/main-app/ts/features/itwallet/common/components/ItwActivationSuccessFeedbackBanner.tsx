import { Banner } from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { memo, useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import {
  trackItwSurveyRequest,
  trackItwSurveyRequestAccepted
} from "../../analytics";
import { TrackQualtricsSurvey } from "../../analytics/utils/types";
import { IT_WALLET_SURVEY_EID_ACTIVATION_SUCCESS } from "../utils/constants";
import { openWebUrl } from "../../../../utils/url";

type Props = {
  /** Current Documenti su IO status: active if eID was already valid before, not_active otherwise. */
  docStatus: "active" | "not_active";
  /** Authentication method used: spid | cieidL2 | cieidL3 | ciepin */
  authMethod: string;
};

const ItwActivationSuccessFeedbackBanner = ({
  docStatus,
  authMethod
}: Props) => {
  const [isVisible, setIsVisible] = useState(true);
  const { name: routeName } = useRoute();

  const trackingProps: TrackQualtricsSurvey = useMemo(
    () => ({
      survey_id: "confirm_eid_flow_success",
      survey_page: routeName
    }),
    [routeName]
  );

  useFocusEffect(
    useCallback(() => {
      trackItwSurveyRequest(trackingProps);
    }, [trackingProps])
  );

  const surveyUrl = `${IT_WALLET_SURVEY_EID_ACTIVATION_SUCCESS}?doc_status=${docStatus}&auth_method=${authMethod}`;

  const handleOnPress = useCallback(() => {
    trackItwSurveyRequestAccepted(trackingProps);
    openWebUrl(surveyUrl);
  }, [trackingProps, surveyUrl]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={{ marginTop: 24 }}>
      <Banner
        testID="itwActivationSuccessFeedbackBannerTestID"
        title={I18n.t(
          "features.itWallet.feedback.eidActivationSuccess.banner.title"
        )}
        content={I18n.t(
          "features.itWallet.feedback.eidActivationSuccess.banner.content"
        )}
        action={I18n.t(
          "features.itWallet.feedback.eidActivationSuccess.banner.action"
        )}
        pictogramName="feedback"
        color="neutral"
        onPress={handleOnPress}
        onClose={() => setIsVisible(false)}
        labelClose={I18n.t("global.buttons.close")}
      />
    </View>
  );
};

export default memo(ItwActivationSuccessFeedbackBanner);

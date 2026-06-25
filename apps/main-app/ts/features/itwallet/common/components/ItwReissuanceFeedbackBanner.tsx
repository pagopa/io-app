import { Banner } from "@pagopa/io-app-design-system";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { memo, useCallback, useMemo } from "react";
import { View } from "react-native";

import { openWebUrl } from "../../../../utils/url";
import {
  trackItwSurveyRequest,
  trackItwSurveyRequestAccepted
} from "../../analytics";
import { TrackQualtricsSurvey } from "../../analytics/utils/types.ts";
import { IT_WALLET_SURVEY_EID_REISSUANCE_SUCCESS } from "../utils/constants.ts";

const ItwReissuanceFeedbackBanner = () => {
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

  const handleOnPress = useCallback(() => {
    trackItwSurveyRequestAccepted(trackingProps);
    openWebUrl(IT_WALLET_SURVEY_EID_REISSUANCE_SUCCESS);
  }, [trackingProps]);

  return (
    <View style={{ marginTop: 24 }}>
      <Banner
        action={I18n.t("features.itWallet.feedback.reissuance.banner.action")}
        color="neutral"
        content={I18n.t("features.itWallet.feedback.reissuance.banner.content")}
        labelClose={I18n.t("global.buttons.close")}
        onPress={handleOnPress}
        pictogramName="feedback"
        testID="itwFeedbackBannerTestID"
        title={I18n.t("features.itWallet.feedback.reissuance.banner.title")}
      />
    </View>
  );
};

const MemoizedItwReissuanceFeedbackBanner = memo(ItwReissuanceFeedbackBanner);

export { MemoizedItwReissuanceFeedbackBanner as ItwReissuanceFeedbackBanner };

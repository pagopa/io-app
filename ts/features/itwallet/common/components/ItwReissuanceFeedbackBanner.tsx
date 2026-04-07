import { Banner } from "@pagopa/io-app-design-system";
import { memo, useCallback, useMemo } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import I18n from "i18next";
import { openWebUrl } from "../../../../utils/url";
import { IT_WALLET_SURVEY_EID_REISSUANCE_SUCCESS } from "../utils/constants.ts";
import {
  trackItwSurveyRequest,
  trackItwSurveyRequestAccepted
} from "../../analytics";
import { TrackQualtricsSurvey } from "../../analytics/utils/types.ts";

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
        testID="itwFeedbackBannerTestID"
        title={I18n.t("features.itWallet.feedback.reissuance.banner.title")}
        content={I18n.t("features.itWallet.feedback.reissuance.banner.content")}
        action={I18n.t("features.itWallet.feedback.reissuance.banner.action")}
        pictogramName="feedback"
        color="neutral"
        onPress={handleOnPress}
        labelClose={I18n.t("global.buttons.close")}
      />
    </View>
  );
};

const MemoizedItwReissuanceFeedbackBanner = memo(ItwReissuanceFeedbackBanner);

export { MemoizedItwReissuanceFeedbackBanner as ItwReissuanceFeedbackBanner };

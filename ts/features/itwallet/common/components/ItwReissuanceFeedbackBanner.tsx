import { Banner } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import { itwCloseReissuanceFeedbackBanner } from "../store/actions/preferences";
import { itwIsReissuanceFeedbackBannerHiddenSelector } from "../store/selectors/preferences.ts";
import { IT_WALLET_SURVEY_EID_REISSUANCE_SUCCESS } from "../utils/constants.ts";

const ItwReissuanceFeedbackBanner = () => {
  const dispatch = useIODispatch();
  const hidden = useIOSelector(itwIsReissuanceFeedbackBannerHiddenSelector);

  if (hidden) {
    return null;
  }

  const handleOnPress = () => {
    openWebUrl(IT_WALLET_SURVEY_EID_REISSUANCE_SUCCESS);
  };

  const handleOnClose = () => {
    dispatch(itwCloseReissuanceFeedbackBanner());
  };

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
        onClose={handleOnClose}
      />
    </View>
  );
};

const MemoizedItwReissuanceFeedbackBanner = memo(ItwReissuanceFeedbackBanner);

export { MemoizedItwReissuanceFeedbackBanner as ItwReissuanceFeedbackBanner };

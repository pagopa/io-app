import { Banner } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import { itwCloseFeedbackBanner } from "../store/actions/preferences";
import { itwShouldRenderFeedbackBannerSelector } from "../store/selectors";

const ItwFeedbackBanner = () => {
  const dispatch = useIODispatch();
  const shouldRender = useIOSelector(itwShouldRenderFeedbackBannerSelector);

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    openWebUrl("https://pagopa.qualtrics.com/jfe/form/SV_40ije50GQj63CJ0");
  };

  const handleOnClose = () => {
    dispatch(itwCloseFeedbackBanner());
  };

  return (
    <View style={{ marginTop: 16 }}>
      <Banner
        testID="itwFeedbackBannerTestID"
        title={I18n.t("features.itWallet.feedback.banner.title")}
        content={I18n.t("features.itWallet.feedback.banner.content")}
        action={I18n.t("features.itWallet.feedback.banner.action")}
        pictogramName="feedback"
        color="neutral"
        size="big"
        onPress={handleOnPress}
        labelClose={I18n.t("global.buttons.close")}
        onClose={handleOnClose}
      />
    </View>
  );
};

const MemoizedItwFeedbackBanner = memo(ItwFeedbackBanner);

export { MemoizedItwFeedbackBanner as ItwFeedbackBanner };

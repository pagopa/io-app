import { Banner } from "@pagopa/io-app-design-system";
import React from "react";
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
    dispatch(itwCloseFeedbackBanner({ withFeedback: true }));
  };

  const handleOnClose = () => {
    dispatch(itwCloseFeedbackBanner({}));
  };

  return (
    <Banner
      testID="itwFeedbackBannerTestID"
      title={"Dicci cosa ne pensi"}
      content={
        "Raccontaci la tua esperienza con la funzionalità Documenti su IO."
      }
      action={"Inizia"}
      pictogramName="feedback"
      color="neutral"
      size="big"
      onPress={handleOnPress}
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
    />
  );
};

const MemoizedItwFeedbackBanner = React.memo(ItwFeedbackBanner);

export { MemoizedItwFeedbackBanner as ItwFeedbackBanner };

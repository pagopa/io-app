import { Banner } from "@pagopa/io-app-design-system";
import React from "react";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import { itwIsWalletEmptySelector } from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { itwCloseFeedbackBanner } from "../store/actions/preferences";
import { itwIsFeedbackBannerVisibleSelector } from "../store/reducers/preferences";

const ItwFeebdackBanner = () => {
  const dispatch = useIODispatch();
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isWalletEmpty = useIOSelector(itwIsWalletEmptySelector);
  const shouldBeVisible = useIOSelector(itwIsFeedbackBannerVisibleSelector);

  if (!isItwValid || isWalletEmpty || !shouldBeVisible) {
    // We should display this banner only if the wallet is active and there is at least 1 credential
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
      testID="itwWalletReadyBannerTestID"
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

const MemoizedItwFeebdackBanner = React.memo(ItwFeebdackBanner);

export { MemoizedItwFeebdackBanner as ItwFeebdackBanner };

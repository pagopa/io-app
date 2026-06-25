import { Banner, IOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";

import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { openWebUrl } from "../../../../../utils/url";
import { itwCloseBanner } from "../../../common/store/actions/banners";
import { itwShouldRenderAgeVerificationUsageDetailsBannerSelector } from "../../../common/store/selectors";

const i18nNs =
  "features.itWallet.presentation.credentialDetails.ageVerification.usageBanner";

// TODO: [SIW-4242] replace with the Age Verification Help Center article URL once published.
const AGE_VERIFICATION_HELP_CENTER_URL = "https://assistenza.ioapp.it/hc/it";

/**
 * Banner showing where the Age Verification credential can be used.
 */
export const ItwPresentationAgeVerificationUsageBanner = () => {
  const dispatch = useIODispatch();
  const shouldRender = useIOSelector(
    itwShouldRenderAgeVerificationUsageDetailsBannerSelector
  );
  const title = I18n.t(`${i18nNs}.title`);
  const content = I18n.t(`${i18nNs}.content`);

  const handleOnPress = () =>
    openWebUrl(AGE_VERIFICATION_HELP_CENTER_URL, () =>
      IOToast.error(I18n.t("genericError"))
    );

  if (!shouldRender) {
    return null;
  }

  return (
    <Banner
      action={I18n.t("global.buttons.findOutMore")}
      color="neutral"
      content={content}
      labelClose={I18n.t("global.buttons.close")}
      onClose={() => dispatch(itwCloseBanner("ageVerificationUsageDetails"))}
      onPress={handleOnPress}
      pictogramName="help"
      testID="ageVerificationUsageBannerTestID"
      title={title}
    />
  );
};

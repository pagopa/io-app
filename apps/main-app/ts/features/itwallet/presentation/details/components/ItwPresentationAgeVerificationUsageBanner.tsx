import { Banner, IOToast } from "@io-app/design-system";
import I18n from "i18next";
import { openWebUrl } from "../../../../../utils/url";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { itwCloseBanner } from "../../../common/store/actions/banners";
import { itwShouldRenderAgeVerificationUsageDetailsBannerSelector } from "../../../common/store/selectors";

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

  const handleOnPress = () =>
    openWebUrl(AGE_VERIFICATION_HELP_CENTER_URL, () =>
      IOToast.error(I18n.t("genericError"))
    );

  if (!shouldRender) {
    return null;
  }

  return (
    <Banner
      testID="ageVerificationUsageBannerTestID"
      title={I18n.t(
        "features.itWallet.presentation.credentialDetails.ageVerification.usageBanner.title"
      )}
      content={I18n.t(
        "features.itWallet.presentation.credentialDetails.ageVerification.usageBanner.content"
      )}
      action={I18n.t("global.buttons.findOutMore")}
      pictogramName="help"
      color="neutral"
      onPress={handleOnPress}
      labelClose={I18n.t("global.buttons.close")}
      onClose={() => dispatch(itwCloseBanner("ageVerificationUsageDetails"))}
    />
  );
};

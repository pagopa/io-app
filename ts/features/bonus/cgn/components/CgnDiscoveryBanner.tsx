import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { VoidType } from "io-ts";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  engagementCGNDiscoveryBannerSelector,
  isCGNDiscoveryBannerEnabledSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../../utils/locale";
import { trackStartAddNewCredential } from "../../../itwallet/analytics";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";
import useCgnEligibility from "../hooks/useCgnEligibility.tsx";
import { cgnActivationStart } from "../store/actions/activation";
import { isCgnEnrolledSelector } from "../store/reducers/details";

const CgnDiscoveryBanner = () => {
  const dispatch = useIODispatch();
  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  const isRemoteBannerEnabled = useIOSelector(
    isCGNDiscoveryBannerEnabledSelector
  );

  const engagementBannerContent = useIOSelector(
    engagementCGNDiscoveryBannerSelector
  );
  const eligibleForCgn = useCgnEligibility();
  const isCgnEnrolled = useIOSelector(isCgnEnrolledSelector);

  if (!eligibleForCgn || !isRemoteBannerEnabled || !engagementBannerContent) {
    return null;
  }

  if (isCgnEnrolled) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.duration(300)}
    >
      <VSpacer size={16} />
      <Banner
        testID="itwDiscoveryBannerTestID"
        title={engagementBannerContent.title?.[localeFallback]}
        content={engagementBannerContent.description[localeFallback]}
        action={
          engagementBannerContent.action?.label[localeFallback] ??
          "Attiva Carta Giovani"
        }
        pictogramName="star"
        color="turquoise"
        onClose={() => VoidType}
        labelClose={I18n.t("global.buttons.close")}
        onPress={() => {
          trackStartAddNewCredential("CGN");
          dispatch(loadAvailableBonuses.request());
          dispatch(cgnActivationStart());
        }}
      />
    </Animated.View>
  );
};

export default CgnDiscoveryBanner;

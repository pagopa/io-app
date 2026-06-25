import {
  Banner,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { useCallback } from "react";
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
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../../utils/locale";
import { loadAvailableBonuses } from "../../common/store/actions/availableBonusesTypes";
import { trackCgnEngagementBanner } from "../analytics/index.ts";
import { cgnActivationStart } from "../store/actions/activation";
import { closeCgnDiscoveryBanner } from "../store/actions/banners.ts";
import { cgnDetails } from "../store/actions/details.ts";
import {
  cgnDetailSelector,
  isCgnDetailsAlreadyFetchedSelector
} from "../store/reducers/details";

type Props = {
  handleOnClose: () => void;
};

const CgnDiscoveryBanner = ({ handleOnClose }: Props) => {
  const dispatch = useIODispatch();
  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  const engagementBannerContent = useIOSelector(
    engagementCGNDiscoveryBannerSelector
  );

  const cgnStatus = useIOSelector(cgnDetailSelector);
  const cgnFetched = useIOSelector(isCgnDetailsAlreadyFetchedSelector);
  const isRemoteBannerEnabled = useIOSelector(
    isCGNDiscoveryBannerEnabledSelector
  );

  const shouldFetchCgnDetails =
    isRemoteBannerEnabled && !cgnFetched && pot.isNone(cgnStatus);

  const closeHandler = useCallback(() => {
    trackCgnEngagementBanner("CLOSE_BANNER");
    dispatch(closeCgnDiscoveryBanner());
    handleOnClose();
  }, [dispatch, handleOnClose]);

  const onPressHandler = useCallback(() => {
    trackCgnEngagementBanner("TAP_BANNER");
    dispatch(loadAvailableBonuses.request());
    dispatch(cgnActivationStart());
  }, [dispatch]);

  useOnFirstRender(
    () => {
      trackCgnEngagementBanner("BANNER");
      if (shouldFetchCgnDetails) {
        dispatch(cgnDetails.request());
      }
    },
    () => shouldFetchCgnDetails // && !isBannerClosed
  );

  if (!engagementBannerContent) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.duration(300)}
      style={{
        marginHorizontal: IOVisualCostants.appMarginDefault
      }}
    >
      <VSpacer size={16} />
      <Banner
        action={
          engagementBannerContent.action?.label[localeFallback] ??
          I18n.t("bonus.cgn.engagement.banner.cta")
        }
        color="turquoise"
        content={engagementBannerContent.description[localeFallback]}
        labelClose={I18n.t("global.buttons.close")}
        onClose={closeHandler}
        onPress={onPressHandler}
        pictogramName="star"
        testID="cgnDiscoveryBannerTestID"
        title={engagementBannerContent.title?.[localeFallback]}
      />
    </Animated.View>
  );
};

export default CgnDiscoveryBanner;

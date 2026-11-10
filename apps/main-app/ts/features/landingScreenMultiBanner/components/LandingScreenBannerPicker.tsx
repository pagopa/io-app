import { useMemo } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";

import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { usePushNotificationsBannerTracking } from "../../pushNotifications/hooks/usePushNotificationsBannerTracking";
import { updateLandingScreenBannerVisibility } from "../store/actions";
import { landingScreenBannerToRenderSelector } from "../store/selectors";
import { landingScreenBannerMap } from "../utils/landingScreenBannerMap";
import { LandingScreenBannerSkeleton } from "./LandingScreenBannerSkeleton";

const BANNER_TRANSITION_DURATION = 300;

export const bannerLayoutTransition = LinearTransition.duration(
  BANNER_TRANSITION_DURATION
);
const bannerEntering = FadeIn.duration(BANNER_TRANSITION_DURATION);
const bannerExiting = FadeOut.duration(BANNER_TRANSITION_DURATION / 2);

export const LandingScreenBannerPicker = () => {
  const dispatch = useIODispatch();
  const bannerToRender = useIOSelector(landingScreenBannerToRenderSelector);
  usePushNotificationsBannerTracking();

  const bannerId =
    bannerToRender.type === "banner" ? bannerToRender.id : undefined;

  const content = useMemo(() => {
    if (bannerToRender.type === "loading") {
      return <LandingScreenBannerSkeleton />;
    }
    if (bannerId === undefined) {
      return null;
    }
    const entry = landingScreenBannerMap[bannerId];
    const closeHandler = () => {
      dispatch(
        updateLandingScreenBannerVisibility({
          id: bannerId,
          enabled: false
        })
      );
    };
    return entry.component(closeHandler);
  }, [bannerToRender.type, bannerId, dispatch]);

  // The container is always mounted so its height change between skeleton,
  // banner and nothing is animated, while the keyed content cross-fades
  return (
    <Animated.View layout={bannerLayoutTransition}>
      {content && (
        <Animated.View
          entering={bannerEntering}
          exiting={bannerExiting}
          key={bannerId ?? bannerToRender.type}
        >
          {content}
        </Animated.View>
      )}
    </Animated.View>
  );
};

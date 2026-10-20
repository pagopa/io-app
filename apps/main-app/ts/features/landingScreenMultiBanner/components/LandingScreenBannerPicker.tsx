import { useMemo } from "react";

import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { usePushNotificationsBannerTracking } from "../../pushNotifications/hooks/usePushNotificationsBannerTracking";
import { updateLandingScreenBannerVisibility } from "../store/actions";
import { landingScreenBannerToRenderSelector } from "../store/selectors";
import { landingScreenBannerMap } from "../utils/landingScreenBannerMap";
import { LandingScreenBannerSkeleton } from "./LandingScreenBannerSkeleton";
import { LandingScreenBannerTransition } from "./LandingScreenBannerTransition";

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

  return (
    <LandingScreenBannerTransition contentKey={bannerId ?? bannerToRender.type}>
      {content}
    </LandingScreenBannerTransition>
  );
};

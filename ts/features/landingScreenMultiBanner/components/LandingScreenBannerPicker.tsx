import { useMemo } from "react";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { usePushNotificationsBannerTracking } from "../../pushNotifications/hooks/usePushNotificationsBannerTracking";
import { updateLandingScreenBannerVisibility } from "../store/actions";
import { landingScreenBannerToRenderSelector } from "../store/selectors";
import { landingScreenBannerMap } from "../utils/landingScreenBannerMap";

export const LandingScreenBannerPicker = () => {
  const dispatch = useIODispatch();
  const bannerToRender = useIOSelector(landingScreenBannerToRenderSelector);
  usePushNotificationsBannerTracking();

  return useMemo(() => {
    if (bannerToRender === undefined) {
      return null;
    }
    const entry = landingScreenBannerMap[bannerToRender];
    const closeHandler = () => {
      dispatch(
        updateLandingScreenBannerVisibility({
          id: bannerToRender,
          enabled: false
        })
      );
    };
    return entry.component(closeHandler);
  }, [bannerToRender, dispatch]);
};

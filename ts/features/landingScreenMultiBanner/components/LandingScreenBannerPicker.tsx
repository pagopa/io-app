import * as React from "react";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { landingScreenBannerToRenderSelector } from "../store/selectors";
import { updateLandingScreenBannerVisibility } from "../store/actions";
import { landingScreenBannerMap } from "../utils/landingScreenBannerMap";
import { usePushNotificationsBannerTracking } from "../../pushNotifications/hooks/usePushNotificationsBannerTracking";

export const LandingScreenBannerPicker = () => {
  const dispatch = useIODispatch();
  const bannerToRender = useIOSelector(landingScreenBannerToRenderSelector);

  const closeHandler = React.useCallback(() => {
    if (bannerToRender) {
      dispatch(
        updateLandingScreenBannerVisibility({
          id: bannerToRender,
          enabled: false
        })
      );
    }
  }, [bannerToRender, dispatch]);

  usePushNotificationsBannerTracking();

  if (bannerToRender === undefined) {
    return null;
  }
  const entry = landingScreenBannerMap[bannerToRender];
  return entry?.component(closeHandler);
};

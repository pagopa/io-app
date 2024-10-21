import * as React from "react";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { LandingScreenBannerToRenderSelector } from "./store/selectors";
import { landingScreenBannerMap } from "./utils/landingScreenBannerMap";
import { updateLandingScreenBannerVisibility } from "./store/actions";

export const LandingScreenBannerPicker = () => {
  const dispatch = useIODispatch();
  const bannerToRender = useIOSelector(LandingScreenBannerToRenderSelector);

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

  if (bannerToRender === undefined) {
    return <></>;
  }

  return landingScreenBannerMap[bannerToRender].component(closeHandler);
};

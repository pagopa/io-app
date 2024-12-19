import { useCallback } from "react";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { landingScreenBannerToRenderSelector } from "../store/selectors";
import { updateLandingScreenBannerVisibility } from "../store/actions";
import { landingScreenBannerMap } from "../utils/landingScreenBannerMap";

export const LandingScreenBannerPicker = () => {
  const dispatch = useIODispatch();
  const bannerToRender = useIOSelector(landingScreenBannerToRenderSelector);

  const closeHandler = useCallback(() => {
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
    return null;
  }
  const entry = landingScreenBannerMap[bannerToRender];
  return entry?.component(closeHandler);
};

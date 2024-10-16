import { Banner } from "@pagopa/io-app-design-system";
import * as React from "react";
import { SettingsDiscoveryBanner } from "../../screens/profile/components/SettingsDiscoveryBanner";
import { useIOSelector } from "../../store/hooks";
import { ItwDiscoveryBanner } from "../itwallet/common/components/ItwDiscoveryBanner";
import { LandingScreenBannerId } from "./store/reducer";
import { LandingScreenBannerToRenderSelector } from "./store/selectors";

export const LandingScreenBannerPicker = () => {
  const bannerToRender = useIOSelector(LandingScreenBannerToRenderSelector);

  if (bannerToRender === undefined) {
    return <></>;
  }
  return componentMap[bannerToRender];
};

const componentMap: { [key in LandingScreenBannerId]: React.ReactElement } = {
  ITW_DISCOVERY: <ItwDiscoveryBanner />,
  SETTINGS_DISCOVERY: <SettingsDiscoveryBanner />,
  // REMOVE_ME
  DEV_TEST123: (
    <Banner
      color="neutral"
      pictogramName="feedback"
      size="big"
      title="TESTING"
    />
  )
};

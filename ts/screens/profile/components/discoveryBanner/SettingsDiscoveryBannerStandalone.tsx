import React, { useCallback } from "react";
import { setHasUserAcknowledgedSettingsBanner } from "../../../../features/profileSettings/store/actions";
import { hasUserAcknowledgedSettingsBannerSelector } from "../../../../features/profileSettings/store/selectors";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { SettingsDiscoveryBanner } from "./SettingsDiscoveryBanner";

export const SettingsDiscoveryBannerStandalone = () => {
  const dispatch = useIODispatch();
  const hasUserAcknowledgedSettingsBanner = useIOSelector(
    hasUserAcknowledgedSettingsBannerSelector
  );

  const setHasUserAcknowledgedSettingsBannerDispatch = useCallback(
    () => dispatch(setHasUserAcknowledgedSettingsBanner(true)),
    [dispatch]
  );

  if (!hasUserAcknowledgedSettingsBanner) {
    return (
      <SettingsDiscoveryBanner
        handleOnClose={setHasUserAcknowledgedSettingsBannerDispatch}
      />
    );
  } else {
    return undefined;
  }
};

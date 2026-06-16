export type IOVersionInfo = {
  min_app_version: IOVersionPerPlatform;
  latest_released_app_version: IOVersionPerPlatform;
  rollout_app_version: IOVersionPerPlatform;
  min_app_version_pagopa?: IOVersionPerPlatform;
};

export type IOVersionPerPlatform = {
  ios: string;
  android: string;
};

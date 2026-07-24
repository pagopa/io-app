export type IOVersionInfo = {
  latest_released_app_version: IOVersionPerPlatform;
  min_app_version: IOVersionPerPlatform;
  min_app_version_pagopa?: IOVersionPerPlatform;
  rollout_app_version: IOVersionPerPlatform;
};

export type IOVersionPerPlatform = {
  android: string;
  ios: string;
};

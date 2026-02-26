import { Platform } from "react-native";
import { minOsSupportedSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";

export const isOsDismissionisBannerRenderableSelector = (
  state: GlobalState
): boolean => {
  const minOsSupported = minOsSupportedSelector(state);
  if (!minOsSupported) {
    return false;
  }
  const currentOsVersion =
    typeof Platform.Version === "string"
      ? parseFloat(Platform.Version)
      : Platform.Version;

  return (
    Platform.select({
      ios: currentOsVersion < parseFloat(minOsSupported.ios),
      android: currentOsVersion < parseFloat(minOsSupported.android)
    }) ?? false
  );
};

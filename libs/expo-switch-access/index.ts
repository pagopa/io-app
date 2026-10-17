import { requireOptionalNativeModule } from "expo-modules-core";

type ExpoSwitchAccessModule = {
  isEnabled: () => Promise<boolean>;
};

const ExpoSwitchAccess =
  requireOptionalNativeModule<ExpoSwitchAccessModule>("ExpoSwitchAccess");

export const isSwitchAccessEnabled = (): Promise<boolean> =>
  ExpoSwitchAccess?.isEnabled() ?? Promise.resolve(false);

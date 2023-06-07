import React from "react";
import { Platform, Switch, SwitchProps } from "react-native";
import { IOColors } from "../../variables/IOColors";
import { IOSwitchVisualParams } from "../../variables/IOStyles";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";

type OwnProps = Pick<SwitchProps, "onValueChange" | "value">;

const bgLegacyTrackColorAndroid =
  Platform.OS === "android" ? IOColors["grey-300"] : IOColors.greyUltraLight;

export const NativeSwitch = ({ onValueChange, value }: OwnProps) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return (
    <Switch
      trackColor={{
        false: isDesignSystemEnabled
          ? IOColors[IOSwitchVisualParams.bgColorOffState]
          : bgLegacyTrackColorAndroid,
        true: isDesignSystemEnabled
          ? IOColors[IOSwitchVisualParams.bgColorOnState]
          : IOColors.blue
      }}
      thumbColor={IOColors[IOSwitchVisualParams.bgCircle]}
      ios_backgroundColor={
        isDesignSystemEnabled
          ? IOColors[IOSwitchVisualParams.bgColorOffState]
          : bgLegacyTrackColorAndroid
      }
      onValueChange={onValueChange}
      value={value}
    />
  );
};

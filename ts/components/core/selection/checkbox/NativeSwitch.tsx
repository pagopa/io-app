import React from "react";
import { Switch, SwitchProps } from "react-native";
import { IOColors } from "../../variables/IOColors";
import { IOSwitchVisualParams } from "../../variables/IOStyles";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";

type OwnProps = Pick<SwitchProps, "onValueChange" | "value">;

export const NativeSwitch = ({ onValueChange, value }: OwnProps) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return (
    <Switch
      trackColor={{
        false: isDesignSystemEnabled
          ? IOColors[IOSwitchVisualParams.bgColorOffState]
          : IOColors.greyUltraLight,
        true: isDesignSystemEnabled
          ? IOColors[IOSwitchVisualParams.bgColorOnState]
          : IOColors.blue
      }}
      thumbColor={IOColors[IOSwitchVisualParams.bgCircle]}
      ios_backgroundColor={
        isDesignSystemEnabled
          ? IOColors[IOSwitchVisualParams.bgColorOffState]
          : IOColors.greyUltraLight
      }
      onValueChange={onValueChange}
      value={value}
    />
  );
};

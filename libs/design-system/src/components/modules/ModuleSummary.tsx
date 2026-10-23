import { View } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions } from "../../core";
import { Icon, IOIcons } from "../icons";
import { BodySmall, H6 } from "../typography";
import {
  PressableModuleBase,
  PressableModuleBaseProps
} from "./PressableModuleBase";

type Props = {
  description?: string;
  icon?: IOIcons;
  label: string;
  onPress: PressableModuleBaseProps["onPress"];
};

export const ModuleSummary = ({
  label,
  description,
  onPress,
  icon = "info"
}: Props) => {
  const moduleColors = useIOColors().component.module;

  return (
    <PressableModuleBase onPress={onPress}>
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <H6 color={moduleColors.foreground.label}>{label}</H6>
        {description && (
          <BodySmall
            color={moduleColors.foreground.description}
            weight="Regular"
          >
            {description}
          </BodySmall>
        )}
      </View>
      <View style={{ marginLeft: IODimensions.gap.module.trailing }}>
        <Icon color={moduleColors.foreground.action} name={icon} size={24} />
      </View>
    </PressableModuleBase>
  );
};

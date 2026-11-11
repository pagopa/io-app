import { View } from "react-native";

import { useIOTheme } from "../../context";
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
  const theme = useIOTheme();

  return (
    <PressableModuleBase onPress={onPress}>
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <H6 color={theme["textBody-default"]}>{label}</H6>
        {description && (
          <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
            {description}
          </BodySmall>
        )}
      </View>
      <View style={{ marginLeft: IODimensions.gap.module.trailing }}>
        <Icon color={theme["interactiveElem-default"]} name={icon} size={24} />
      </View>
    </PressableModuleBase>
  );
};

import { View } from "react-native";
import { useIOTheme } from "../../context";
import { IOIcons, Icon } from "../icons";
import { H6, BodySmall } from "../typography";
import {
  PressableModuleBase,
  PressableModuleBaseProps
} from "./PressableModuleBase";

type Props = {
  label: string;
  description?: string;
  onPress: PressableModuleBaseProps["onPress"];
  icon?: IOIcons;
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
          <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
            {description}
          </BodySmall>
        )}
      </View>
      <View style={{ marginLeft: 8 }}>
        <Icon name={icon} color={theme["interactiveElem-default"]} size={24} />
      </View>
    </PressableModuleBase>
  );
};

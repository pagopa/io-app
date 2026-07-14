import { ComponentProps } from "react";
import { View } from "react-native";

import { useIOTheme } from "../../context";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOSpacingScale
} from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { H3, H6 } from "../typography";

export type ListItemAmount = IconProps &
  WithTestID<{
    // Accessibility
    accessibilityLabel?: string;
    label: string;
    valueElementProps?: ValueProps;
    valueString: string;
  }>;

type IconProps =
  | {
      iconColor?: ComponentProps<typeof Icon>["color"];
      iconName: IOIcons;
    }
  | { iconColor?: never; iconName?: never };

type ValueProps = ComponentProps<typeof H3>;

const iconMargin: IOSpacingScale = 8;

export const ListItemAmount = ({
  label,
  iconName,
  iconColor,
  valueElementProps,
  valueString,
  accessibilityLabel,
  testID
}: ListItemAmount) => {
  const theme = useIOTheme();
  const { dynamicFontScale, spacingScaleMultiplier, hugeFontEnabled } =
    useIOFontDynamicScale();

  const listItemAccessibilityLabel = accessibilityLabel || `${label}`;

  const itemInfoTextComponent = (
    <View
      accessibilityElementsHidden={false}
      accessible={false}
      importantForAccessibility={"no-hide-descendants"}
    >
      <H6 color={theme["textBody-tertiary"]}>{label}</H6>
    </View>
  );

  return (
    <View
      accessibilityLabel={listItemAccessibilityLabel}
      accessible
      style={IOListItemStyles.listItem}
      testID={testID}
    >
      <View
        style={[
          IOListItemStyles.listItemInner,
          { columnGap: iconMargin * dynamicFontScale * spacingScaleMultiplier }
        ]}
      >
        {iconName && !hugeFontEnabled && (
          <Icon
            allowFontScaling
            color={iconColor ?? theme["icon-decorative"]}
            name={iconName}
            size={IOListItemVisualParams.iconSize}
          />
        )}
        <View style={{ flex: 1 }}>{itemInfoTextComponent}</View>
        <H3
          {...valueElementProps}
          accessibilityLabel={`${listItemAccessibilityLabel}; ${
            valueElementProps?.accessibilityLabel ?? ""
          }`}
          color={theme["textBody-default"]}
        >
          {valueString}
        </H3>
      </View>
    </View>
  );
};

import { ComponentProps, useCallback, useMemo } from "react";
import { View } from "react-native";

import { useIOTheme } from "../../context";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOSelectionListItemVisualParams,
  IOSpacingScale,
  IOVisualCostants
} from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { IconButton, IOButton, IOButtonLinkSpecificProps } from "../buttons";
import { Icon, IOIcons } from "../icons";
import { VSpacer } from "../layout";
import { BodySmall, H6 } from "../typography";

export type ListItemHeader = IconProps &
  WithTestID<{
    // Accessibility
    accessibilityLabel?: string;
    description?: string;
    endElement?: EndElementProps;
    label: string;
    numberOfLines?: number;
  }>;

type BadgeProps = {
  componentProps: ComponentProps<typeof Badge>;
  type: "badge";
};

type ButtonLinkActionProps = {
  componentProps: Omit<IOButtonLinkSpecificProps, "variant">;
  type: "buttonLink";
};

type EndElementProps =
  | BadgeProps
  | ButtonLinkActionProps
  | IconButtonActionProps;

type IconButtonActionProps = {
  componentProps: ComponentProps<typeof IconButton>;
  type: "iconButton";
};

type IconProps =
  | {
      iconColor?: ComponentProps<typeof Icon>["color"];
      iconName: IOIcons;
    }
  | { iconColor?: never; iconName?: never };

const iconMargin: IOSpacingScale = IOVisualCostants.iconMargin;

export const ListItemHeader = ({
  label,
  iconName,
  iconColor,
  endElement,
  description,
  accessibilityLabel,
  testID
}: ListItemHeader) => {
  const theme = useIOTheme();

  const { dynamicFontScale, spacingScaleMultiplier, hugeFontEnabled } =
    useIOFontDynamicScale();

  const itemInfoTextComponent = useMemo(
    () => (
      <View
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="header"
        accessible
      >
        <H6 color={theme["textBody-tertiary"]}>{label}</H6>
      </View>
    ),
    [label, accessibilityLabel, theme]
  );

  const listItemAction = useCallback(() => {
    if (endElement) {
      const { type, componentProps } = endElement;

      switch (type) {
        case "badge":
          return <Badge {...componentProps} />;
        case "buttonLink":
          return <IOButton variant="link" {...componentProps} />;
        case "iconButton":
          return <IconButton {...componentProps} />;
        default:
          return <></>;
      }
    }
    return <></>;
  }, [endElement]);

  return (
    <View style={IOListItemStyles.listItem} testID={testID}>
      <View style={IOListItemStyles.listItemInner}>
        {iconName && !hugeFontEnabled && (
          <View
            style={{
              marginRight:
                iconMargin * dynamicFontScale * spacingScaleMultiplier
            }}
          >
            <Icon
              allowFontScaling
              color={iconColor ?? theme["icon-decorative"]}
              name={iconName}
              size={IOListItemVisualParams.iconSize}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>{itemInfoTextComponent}</View>
        {endElement && (
          <View style={{ marginLeft: IOListItemVisualParams.actionMargin }}>
            {listItemAction()}
          </View>
        )}
      </View>
      {description && (
        <View>
          <VSpacer size={IOSelectionListItemVisualParams.descriptionMargin} />
          <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
            {description}
          </BodySmall>
        </View>
      )}
    </View>
  );
};

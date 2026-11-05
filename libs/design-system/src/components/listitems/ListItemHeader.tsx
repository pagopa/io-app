import { ComponentProps, useCallback, useMemo } from "react";
import { View } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions, IOListItemStyles, IORoleColor } from "../../core";
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
      /* A semantic token: it has a value in both modes */
      iconColor?: IORoleColor<"foreground">;
      iconName: IOIcons;
    }
  | { iconColor?: never; iconName?: never };

export const ListItemHeader = ({
  label,
  iconName,
  iconColor,
  endElement,
  description,
  accessibilityLabel,
  testID
}: ListItemHeader) => {
  const listItemColors = useIOColors().component.listItem;

  const { dynamicFontScale, spacingScaleMultiplier, hugeFontEnabled } =
    useIOFontDynamicScale();

  const itemInfoTextComponent = useMemo(
    () => (
      <View
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="header"
        accessible
      >
        <H6 color={listItemColors.foreground.description}>{label}</H6>
      </View>
    ),
    [label, accessibilityLabel, listItemColors]
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
                IODimensions.gap.listItem.default.leading *
                dynamicFontScale *
                spacingScaleMultiplier
            }}
          >
            <Icon
              allowFontScaling
              color={iconColor ?? listItemColors.foreground.icon.decorative}
              name={iconName}
              size={IODimensions.size.icon.listItem}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>{itemInfoTextComponent}</View>
        {endElement && (
          <View
            style={{ marginLeft: IODimensions.gap.listItem.default.action }}
          >
            {listItemAction()}
          </View>
        )}
      </View>
      {description && (
        <View>
          <VSpacer size={IODimensions.gap.listItem.default.description} />
          <BodySmall
            color={listItemColors.foreground.description}
            weight="Regular"
          >
            {description}
          </BodySmall>
        </View>
      )}
    </View>
  );
};

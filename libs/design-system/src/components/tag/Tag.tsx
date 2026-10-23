import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { useIOColors } from "../../context";
import { IOColors, IODimensions } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { IOText } from "../typography";

export type Tag = TextProps &
  WithTestID<
    | {
        icon: VariantProps;
        variant: "custom";
      }
    | {
        icon?: never;
        iconName?: never;
        variant:
          | "attachment"
          | "error"
          | "info"
          | "legalMessage"
          | "noIcon"
          | "qrCode"
          | "success"
          | "warning";
      }
  > & {
    allowFontScaling?: boolean;
  } & { forceLightMode?: boolean };

export type TagIconColor =
  | "error"
  | "grey"
  | "info"
  | "lightGrey"
  | "primary"
  | "success"
  | "warning";

type TextProps =
  | {
      iconAccessibilityLabel: string;
      text?: never;
    }
  | {
      iconAccessibilityLabel?: string;
      text: string;
    };

type VariantProps = {
  color: TagIconColor;
  name: IOIcons;
};

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    }),
    overflow: "hidden",
    borderWidth: IODimensions.stroke.default,
    borderCurve: "continuous"
  },
  tagStatic: {
    borderRadius: IODimensions.radius.tag,
    borderCurve: "continuous",
    paddingHorizontal: IODimensions.padding.tag.horizontal,
    paddingVertical: IODimensions.padding.tag.vertical,
    columnGap: IODimensions.gap.tag.leading
  },
  iconWrapper: {
    flexShrink: 0
  }
});

const getVariantProps = (
  variant: NonNullable<Tag["variant"]>,
  customIcon?: VariantProps
): undefined | VariantProps => {
  if (variant === "custom" && customIcon) {
    return customIcon;
  }
  switch (variant) {
    case "attachment":
      return {
        color: "grey",
        name: "paperclip"
      };
    case "error":
      return {
        color: "error",
        name: "errorFilled"
      };
    case "info":
      return {
        color: "info",
        name: "infoFilled"
      };
    case "legalMessage":
      return {
        color: "primary",
        name: "legalValue"
      };
    case "noIcon":
      return undefined;
    case "qrCode":
      return {
        color: "primary",
        name: "qrCode"
      };
    case "success":
      return {
        color: "success",
        name: "success"
      };
    case "warning":
      return {
        color: "warning",
        name: "warningFilled"
      };
    default:
      return undefined;
  }
};

/** Tag component, used mainly for message list and details */
export const Tag = ({
  text,
  variant,
  testID,
  icon,
  iconAccessibilityLabel,
  allowFontScaling = true,
  forceLightMode = false
}: Tag) => {
  const colors = useIOColors();
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const variantProps = getVariantProps(variant, icon);

  const tagColors = forceLightMode
    ? IOColors.light.component.tag
    : colors.component.tag;

  const tagDynamic: ViewStyle = {
    paddingHorizontal: IODimensions.padding.tag.horizontal * dynamicFontScale,
    paddingVertical: IODimensions.padding.tag.vertical * dynamicFontScale,
    columnGap:
      IODimensions.gap.tag.leading * dynamicFontScale * spacingScaleMultiplier,
    borderRadius: IODimensions.radius.tag * dynamicFontScale
  };

  return (
    <View
      style={[
        styles.tag,
        allowFontScaling ? tagDynamic : styles.tagStatic,
        {
          borderColor: tagColors.border.default,
          backgroundColor: tagColors.background.default
        }
      ]}
      testID={testID}
    >
      {variantProps && (
        <View style={styles.iconWrapper}>
          <Icon
            accessibilityLabel={iconAccessibilityLabel}
            accessible={!!iconAccessibilityLabel}
            allowFontScaling={allowFontScaling}
            color={tagColors.icon[variantProps.color]}
            name={variantProps.name}
            size={IODimensions.size.icon.tag}
          />
        </View>
      )}
      {text && (
        <IOText
          allowFontScaling={allowFontScaling}
          color={tagColors.foreground.default}
          ellipsizeMode="tail"
          lineHeight={16}
          numberOfLines={1}
          size={12}
          style={{
            alignSelf: "center",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            flexShrink: 1
          }}
          weight={"Semibold"}
        >
          {text}
        </IOText>
      )}
    </View>
  );
};

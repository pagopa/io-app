import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { useIOTheme } from "../../context";
import {
  IOColorsLegacy,
  IODimensions,
  IOTheme,
  IOThemeLight
} from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { IOText } from "../typography";

const IconColorsMap: Record<string, keyof IOTheme> = {
  primary: "interactiveElem-default",
  warning: "warningIcon",
  error: "errorIcon",
  success: "successIcon",
  info: "infoIcon",
  grey: "icon-default",
  lightGrey: "icon-decorative"
};

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

type IconColorVariant = keyof typeof IconColorsMap;

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
  color: IconColorVariant;
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
  const theme = useIOTheme();
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const variantProps = getVariantProps(variant, icon);

  const borderColor = forceLightMode
    ? IOColorsLegacy[IOThemeLight["cardBorder-default"]]
    : IOColorsLegacy[theme["cardBorder-default"]];

  const backgroundColor = forceLightMode
    ? IOColorsLegacy[IOThemeLight["appBackground-primary"]]
    : IOColorsLegacy[theme["appBackground-primary"]];

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
        { borderColor, backgroundColor }
      ]}
      testID={testID}
    >
      {variantProps && (
        <View style={styles.iconWrapper}>
          <Icon
            accessibilityLabel={iconAccessibilityLabel}
            accessible={!!iconAccessibilityLabel}
            allowFontScaling={allowFontScaling}
            color={
              forceLightMode
                ? IOThemeLight[IconColorsMap[variantProps.color]]
                : theme[IconColorsMap[variantProps.color]]
            }
            name={variantProps.name}
            size={IODimensions.size.icon.tag}
          />
        </View>
      )}
      {text && (
        <IOText
          allowFontScaling={allowFontScaling}
          color={
            forceLightMode
              ? IOThemeLight["textBody-tertiary"]
              : theme["textBody-tertiary"]
          }
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

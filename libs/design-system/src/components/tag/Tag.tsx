import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { useIOTheme } from "../../context";
import {
  IOColors,
  IOSpacingScale,
  IOTagHSpacing,
  IOTagRadius,
  IOTagVSpacing,
  IOTheme,
  IOThemeLight
} from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons, IOIconSizeScale } from "../icons";
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

const IOTagIconMargin: IOSpacingScale = 6;
const IOTagIconSize: IOIconSizeScale = 16;

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
    borderWidth: 1,
    borderCurve: "continuous"
  },
  tagStatic: {
    borderRadius: IOTagRadius,
    borderCurve: "continuous",
    paddingHorizontal: IOTagHSpacing,
    paddingVertical: IOTagVSpacing,
    columnGap: IOTagIconMargin
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
        name: "attachment"
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

/**
 * Tag component, used mainly for message list and details
 */
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
    ? IOColors[IOThemeLight["cardBorder-default"]]
    : IOColors[theme["cardBorder-default"]];

  const backgroundColor = forceLightMode
    ? IOColors[IOThemeLight["appBackground-primary"]]
    : IOColors[theme["appBackground-primary"]];

  const tagDynamic: ViewStyle = {
    paddingHorizontal: IOTagHSpacing * dynamicFontScale,
    paddingVertical: IOTagVSpacing * dynamicFontScale,
    columnGap: IOTagIconMargin * dynamicFontScale * spacingScaleMultiplier,
    borderRadius: IOTagRadius * dynamicFontScale
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
            size={IOTagIconSize}
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

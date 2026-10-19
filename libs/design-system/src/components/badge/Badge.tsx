import {
  ColorValue,
  Platform,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";

import { useIOThemeContext } from "../../context";
import { hexToRgba, IOColorsLegacy, IODimensions } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { IOText } from "../typography";

export type Badge = WithTestID<{
  accessible?: boolean;
  allowFontScaling?: boolean;
  outline?: boolean;
  text: string;
  variant: "cgn" | "default" | "error" | "highlight" | "success" | "warning";
}>;

type OutlinedVariantProps = {
  background?: never;
  foreground: IOColorsLegacy;
};

type SolidVariantProps = {
  background: ColorValue;
  foreground: IOColorsLegacy;
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderCurve: "continuous",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    })
  },
  badgeStaticStyle: {
    borderRadius: IODimensions.radius.badge,
    paddingHorizontal: IODimensions.padding.badge.horizontal,
    paddingVertical: IODimensions.padding.badge.vertical
  }
});

/** Official badge component */
export const Badge = ({
  text,
  outline = false,
  allowFontScaling = true,
  variant,
  accessible = true,
  testID
}: Badge) => {
  const { dynamicFontScale } = useIOFontDynamicScale();
  const { themeType } = useIOThemeContext();

  const bgOpacityDarkMode = 0.2;

  const mapVariantsLightMode: Record<
    NonNullable<Badge["variant"]>,
    SolidVariantProps
  > = {
    default: {
      foreground: "blueIO-850",
      background: IOColorsLegacy["blueIO-50"]
    },
    warning: {
      foreground: "warning-850",
      background: IOColorsLegacy["warning-100"]
    },
    success: {
      foreground: "success-850",
      background: IOColorsLegacy["success-100"]
    },
    error: {
      foreground: "error-850",
      background: IOColorsLegacy["error-100"]
    },
    cgn: {
      foreground: "hanPurple-500",
      background: IOColorsLegacy["hanPurple-100"]
    },
    highlight: {
      foreground: "turquoise-850",
      background: IOColorsLegacy["turquoise-50"]
    }
  };

  const mapVariantsDarkMode: Record<
    NonNullable<Badge["variant"]>,
    SolidVariantProps
  > = {
    default: {
      foreground: "blueIO-200",
      background: hexToRgba(IOColorsLegacy["blueIO-200"], bgOpacityDarkMode)
    },
    warning: {
      foreground: "warning-400",
      background: hexToRgba(IOColorsLegacy["warning-400"], bgOpacityDarkMode)
    },
    success: {
      foreground: "success-400",
      background: hexToRgba(IOColorsLegacy["success-400"], bgOpacityDarkMode)
    },
    error: {
      foreground: "error-400",
      background: hexToRgba(IOColorsLegacy["error-400"], bgOpacityDarkMode)
    },
    cgn: {
      foreground: "hanPurple-250",
      background: hexToRgba(IOColorsLegacy["hanPurple-250"], bgOpacityDarkMode)
    },
    highlight: {
      foreground: "turquoise-300",
      background: hexToRgba(IOColorsLegacy["turquoise-300"], bgOpacityDarkMode)
    }
  };

  const mapOutlineVariantsLightMode: Record<
    NonNullable<Badge["variant"]>,
    OutlinedVariantProps
  > = {
    default: {
      foreground: "blueIO-850"
    },
    warning: {
      foreground: "warning-850"
    },
    success: {
      foreground: "success-850"
    },
    error: {
      foreground: "error-850"
    },
    cgn: {
      foreground: "hanPurple-500"
    },
    highlight: {
      foreground: "turquoise-850"
    }
  };

  const mapOutlineVariantsDarkMode: Record<
    NonNullable<Badge["variant"]>,
    OutlinedVariantProps
  > = {
    default: {
      foreground: "blueIO-200"
    },
    warning: {
      foreground: "warning-400"
    },
    success: {
      foreground: "success-400"
    },
    error: {
      foreground: "error-400"
    },
    cgn: {
      foreground: "hanPurple-250"
    },
    highlight: {
      foreground: "turquoise-300"
    }
  };

  const variantMap =
    themeType === "light"
      ? outline
        ? mapOutlineVariantsLightMode
        : mapVariantsLightMode
      : outline
        ? mapOutlineVariantsDarkMode
        : mapVariantsDarkMode;

  const { background, foreground } = variantMap[variant];

  const dynamicStyle: ViewStyle = {
    borderRadius: IODimensions.radius.badge * dynamicFontScale,
    paddingHorizontal: IODimensions.padding.badge.horizontal * dynamicFontScale,
    paddingVertical: IODimensions.padding.badge.vertical * dynamicFontScale
  };

  return (
    <View
      accessible={accessible}
      style={[
        styles.badge,
        allowFontScaling ? dynamicStyle : styles.badgeStaticStyle,
        outline
          ? {
              borderWidth: IODimensions.stroke.default,
              borderColor: IOColorsLegacy[foreground]
            }
          : {
              backgroundColor: background ?? undefined
            }
      ]}
      testID={testID}
    >
      <IOText
        allowFontScaling={allowFontScaling}
        color={foreground}
        ellipsizeMode="tail"
        lineHeight={16}
        numberOfLines={1}
        size={12}
        style={{
          alignSelf: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5
        }}
        weight={"Semibold"}
      >
        {text}
      </IOText>
    </View>
  );
};

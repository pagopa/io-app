import {
  ColorValue,
  Platform,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { useIOThemeContext } from "../../context";
import {
  hexToRgba,
  IOBadgeHSpacing,
  IOBadgeRadius,
  IOBadgeVSpacing,
  IOColors
} from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { IOText } from "../typography";

export type Badge = WithTestID<{
  outline?: boolean;
  text: string;
  allowFontScaling?: boolean;
  variant: "default" | "warning" | "error" | "success" | "cgn" | "highlight";
  accessible?: boolean;
}>;

type SolidVariantProps = {
  background: ColorValue;
  foreground: IOColors;
};

type OutlinedVariantProps = {
  foreground: IOColors;
  background?: never;
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
    borderRadius: IOBadgeRadius,
    paddingHorizontal: IOBadgeHSpacing,
    paddingVertical: IOBadgeVSpacing
  }
});

/**
 * Official badge component
 */
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
      background: IOColors["blueIO-50"]
    },
    warning: {
      foreground: "warning-850",
      background: IOColors["warning-100"]
    },
    success: {
      foreground: "success-850",
      background: IOColors["success-100"]
    },
    error: {
      foreground: "error-850",
      background: IOColors["error-100"]
    },
    cgn: {
      foreground: "hanPurple-500",
      background: IOColors["hanPurple-100"]
    },
    highlight: {
      foreground: "turquoise-850",
      background: IOColors["turquoise-50"]
    }
  };

  const mapVariantsDarkMode: Record<
    NonNullable<Badge["variant"]>,
    SolidVariantProps
  > = {
    default: {
      foreground: "blueIO-200",
      background: hexToRgba(IOColors["blueIO-200"], bgOpacityDarkMode)
    },
    warning: {
      foreground: "warning-400",
      background: hexToRgba(IOColors["warning-400"], bgOpacityDarkMode)
    },
    success: {
      foreground: "success-400",
      background: hexToRgba(IOColors["success-400"], bgOpacityDarkMode)
    },
    error: {
      foreground: "error-400",
      background: hexToRgba(IOColors["error-400"], bgOpacityDarkMode)
    },
    cgn: {
      foreground: "hanPurple-250",
      background: hexToRgba(IOColors["hanPurple-250"], bgOpacityDarkMode)
    },
    highlight: {
      foreground: "turquoise-300",
      background: hexToRgba(IOColors["turquoise-300"], bgOpacityDarkMode)
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

  // prettier-ignore
  const variantMap = themeType === "light"
    ? (outline ? mapOutlineVariantsLightMode : mapVariantsLightMode)
    : (outline ? mapOutlineVariantsDarkMode : mapVariantsDarkMode);

  const { background, foreground } = variantMap[variant];

  const dynamicStyle: ViewStyle = {
    borderRadius: IOBadgeRadius * dynamicFontScale,
    paddingHorizontal: IOBadgeHSpacing * dynamicFontScale,
    paddingVertical: IOBadgeVSpacing * dynamicFontScale
  };

  return (
    <View
      accessible={accessible}
      testID={testID}
      style={[
        styles.badge,
        allowFontScaling ? dynamicStyle : styles.badgeStaticStyle,
        outline
          ? {
              borderWidth: 1,
              borderColor: IOColors[foreground]
            }
          : {
              backgroundColor: background ?? undefined
            }
      ]}
    >
      <IOText
        allowFontScaling={allowFontScaling}
        weight={"Semibold"}
        size={12}
        lineHeight={16}
        color={foreground}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          alignSelf: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5
        }}
      >
        {text}
      </IOText>
    </View>
  );
};

import {
  interpolateColor,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle
} from "react-native-reanimated";
import { useIOTheme } from "../../../context";
import { hexToRgba, IOColors } from "../../../core/IOColors";
import { IOButtonColor, IOButtonProps, IOButtonVariant } from "./IOButton";

type ColorStates = {
  background: {
    default: string;
    pressed: string;
    disabled: string;
  };
  foreground: {
    default: string;
    pressed: string;
    disabled: string;
  };
};

export const useButtonColorMap = (variant: IOButtonVariant) => {
  const theme = useIOTheme();

  const mapColorStatesVariantSolid: Record<
    NonNullable<IOButtonProps["color"]>,
    ColorStates
  > = {
    // Primary
    primary: {
      background: {
        default: IOColors[theme["interactiveElem-default"]],
        pressed: IOColors[theme["interactiveElem-pressed"]],
        disabled: IOColors[theme["interactiveElem-disabled"]]
      },
      foreground: {
        default: IOColors[theme["buttonText-default"]],
        pressed: IOColors[theme["buttonText-default"]],
        disabled: IOColors[theme["buttonText-disabled"]]
      }
    },
    // Danger
    danger: {
      background: {
        default: IOColors["error-600"],
        pressed: IOColors["error-500"],
        disabled: IOColors[theme["interactiveElem-disabled"]]
      },
      foreground: {
        default: IOColors[theme["buttonText-danger"]],
        pressed: IOColors[theme["buttonText-danger"]],
        disabled: IOColors[theme["buttonText-disabled"]]
      }
    },
    // Contrast
    contrast: {
      background: {
        default: IOColors.white,
        pressed: IOColors["blueIO-50"],
        disabled: IOColors["blueIO-50"]
      },
      foreground: {
        default: IOColors["blueIO-500"],
        pressed: IOColors["blueIO-500"],
        disabled: IOColors["blueIO-500"]
      }
    }
  };

  const mapColorStatesVariantOutline: Record<
    NonNullable<IOButtonProps["color"]>,
    ColorStates
  > = {
    // Primary
    primary: {
      background: {
        default: hexToRgba(IOColors[theme["interactiveElem-pressed"]], 0),
        pressed: hexToRgba(IOColors[theme["interactiveElem-pressed"]], 0.1),
        disabled: "transparent"
      },
      foreground: {
        default: IOColors[theme["interactiveElem-default"]],
        pressed: IOColors[theme["interactiveElem-pressed"]],
        disabled: IOColors[theme["interactiveOutline-disabled"]]
      }
    },
    // Danger
    danger: {
      background: {
        default: hexToRgba(IOColors["error-600"], 0),
        pressed: hexToRgba(IOColors["error-600"], 0.1),
        disabled: "transparent"
      },
      foreground: {
        default: IOColors[theme.errorText],
        pressed: IOColors[theme.errorText],
        disabled: IOColors[theme["buttonText-disabled"]]
      }
    },
    // Contrast
    contrast: {
      background: {
        default: hexToRgba(IOColors["blueIO-600"], 0),
        pressed: hexToRgba(IOColors["blueIO-600"], 0.5),
        disabled: "transparent"
      },
      foreground: {
        default: IOColors.white,
        pressed: IOColors.white,
        disabled: IOColors["blueIO-200"]
      }
    }
  };

  const transparentLinkBackground: ColorStates["background"] = {
    default: "transparent",
    pressed: "transparent",
    disabled: "transparent"
  };

  const mapColorStatesVariantLink: Record<
    NonNullable<IOButtonProps["color"]>,
    ColorStates
  > = {
    // Primary
    primary: {
      foreground: {
        default: IOColors[theme["interactiveElem-default"]],
        pressed: IOColors[theme["interactiveElem-pressed"]],
        disabled: hexToRgba(IOColors[theme["interactiveElem-default"]], 0.85)
      },
      background: transparentLinkBackground
    },
    // Danger
    danger: {
      foreground: {
        default: IOColors[theme.errorText],
        pressed: IOColors[theme.errorText],
        disabled: hexToRgba(IOColors[theme.errorText], 0.85)
      },
      background: transparentLinkBackground
    },
    // Contrast
    contrast: {
      foreground: {
        default: IOColors.white,
        pressed: hexToRgba(IOColors.white, 0.85),
        disabled: hexToRgba(IOColors.white, 0.5)
      },
      background: transparentLinkBackground
    }
  };

  const colorMap = {
    solid: mapColorStatesVariantSolid,
    outline: mapColorStatesVariantOutline,
    link: mapColorStatesVariantLink
  };

  return colorMap[variant];
};

export const useButtonAnimatedStyles = (
  variant: IOButtonVariant,
  color: IOButtonColor,
  progress: SharedValue<number>
) => {
  const mapColorStates = useButtonColorMap(variant);

  // Interpolate animation values from `isPressed` values
  const pressedAnimationStyle = useAnimatedStyle(() => {
    // `link` variant doesn't need this animated style
    if (variant === "link") {
      return {};
    }

    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [
        mapColorStates[color].background.default,
        mapColorStates[color].background.pressed
      ]
    );

    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [
        mapColorStates[color].foreground.default,
        mapColorStates[color].foreground.pressed
      ]
    );

    return variant === "outline"
      ? { backgroundColor, borderColor }
      : { backgroundColor };
  });

  const pressedColorLabelAnimationStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [
        mapColorStates[color].foreground.default,
        mapColorStates[color].foreground.pressed
      ]
    )
  }));

  const iconColorAnimatedStyle = useAnimatedProps(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [
        mapColorStates[color]?.foreground?.default,
        mapColorStates[color]?.foreground?.pressed
      ]
    )
  }));

  return {
    buttonAnimatedStyle: pressedAnimationStyle,
    labelAnimatedStyle: pressedColorLabelAnimationStyle,
    iconColorAnimatedStyle
  };
};

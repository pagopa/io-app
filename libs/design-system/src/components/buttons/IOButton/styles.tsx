import {
  interpolateColor,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle
} from "react-native-reanimated";

import { useIOTheme } from "../../../context";
import { hexToRgba, IOColorsLegacy } from "../../../core/IOColors";
import { IOButtonColor, IOButtonProps, IOButtonVariant } from "./IOButton";

type ColorStates = {
  background: {
    default: string;
    disabled: string;
    pressed: string;
  };
  foreground: {
    default: string;
    disabled: string;
    pressed: string;
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
        default: IOColorsLegacy[theme["interactiveElem-default"]],
        pressed: IOColorsLegacy[theme["interactiveElem-pressed"]],
        disabled: IOColorsLegacy[theme["interactiveElem-disabled"]]
      },
      foreground: {
        default: IOColorsLegacy[theme["buttonText-default"]],
        pressed: IOColorsLegacy[theme["buttonText-default"]],
        disabled: IOColorsLegacy[theme["buttonText-disabled"]]
      }
    },
    // Danger
    danger: {
      background: {
        default: IOColorsLegacy["error-600"],
        pressed: IOColorsLegacy["error-500"],
        disabled: IOColorsLegacy[theme["interactiveElem-disabled"]]
      },
      foreground: {
        default: IOColorsLegacy[theme["buttonText-danger"]],
        pressed: IOColorsLegacy[theme["buttonText-danger"]],
        disabled: IOColorsLegacy[theme["buttonText-disabled"]]
      }
    },
    // Contrast
    contrast: {
      background: {
        default: IOColorsLegacy.white,
        pressed: IOColorsLegacy["blueIO-50"],
        disabled: IOColorsLegacy["blueIO-50"]
      },
      foreground: {
        default: IOColorsLegacy["blueIO-500"],
        pressed: IOColorsLegacy["blueIO-500"],
        disabled: IOColorsLegacy["blueIO-500"]
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
        default: hexToRgba(IOColorsLegacy[theme["interactiveElem-pressed"]], 0),
        pressed: hexToRgba(
          IOColorsLegacy[theme["interactiveElem-pressed"]],
          0.1
        ),
        disabled: "transparent"
      },
      foreground: {
        default: IOColorsLegacy[theme["interactiveElem-default"]],
        pressed: IOColorsLegacy[theme["interactiveElem-pressed"]],
        disabled: IOColorsLegacy[theme["interactiveOutline-disabled"]]
      }
    },
    // Danger
    danger: {
      background: {
        default: hexToRgba(IOColorsLegacy["error-600"], 0),
        pressed: hexToRgba(IOColorsLegacy["error-600"], 0.1),
        disabled: "transparent"
      },
      foreground: {
        default: IOColorsLegacy[theme.errorText],
        pressed: IOColorsLegacy[theme.errorText],
        disabled: IOColorsLegacy[theme["buttonText-disabled"]]
      }
    },
    // Contrast
    contrast: {
      background: {
        default: hexToRgba(IOColorsLegacy["blueIO-600"], 0),
        pressed: hexToRgba(IOColorsLegacy["blueIO-600"], 0.5),
        disabled: "transparent"
      },
      foreground: {
        default: IOColorsLegacy.white,
        pressed: IOColorsLegacy.white,
        disabled: IOColorsLegacy["blueIO-200"]
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
        default: IOColorsLegacy[theme["interactiveElem-default"]],
        pressed: IOColorsLegacy[theme["interactiveElem-pressed"]],
        disabled: hexToRgba(
          IOColorsLegacy[theme["interactiveElem-default"]],
          0.85
        )
      },
      background: transparentLinkBackground
    },
    // Danger
    danger: {
      foreground: {
        default: IOColorsLegacy[theme.errorText],
        pressed: IOColorsLegacy[theme.errorText],
        disabled: hexToRgba(IOColorsLegacy[theme.errorText], 0.85)
      },
      background: transparentLinkBackground
    },
    // Contrast
    contrast: {
      foreground: {
        default: IOColorsLegacy.white,
        pressed: hexToRgba(IOColorsLegacy.white, 0.85),
        disabled: hexToRgba(IOColorsLegacy.white, 0.5)
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

import { GestureResponderEvent, Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion
} from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOIconButtonStyles } from "../../core";
import { hexToRgba, IOColorsLegacy } from "../../core/IOColors";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import { AnimatedIcon, IOIcons } from "../icons";

export type IconButtonSolid = WithTestID<{
  accessibilityHint?: string;
  accessibilityLabel: string;
  color?: "contrast" | "primary";
  disabled?: boolean;
  icon: IOIcons;
  onPress: (event: GestureResponderEvent) => void;
}>;

type ColorStates = {
  background: {
    default: string;
    disabled: string;
    pressed: string;
  };
  icon: {
    default: string;
    disabled: string;
  };
};

export const IconButtonSolid = ({
  icon,
  color = "primary",
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: IconButtonSolid) => {
  const theme = useIOTheme();
  const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("exaggerated");
  const reducedMotion = useReducedMotion();

  const mapColorStates: Record<
    NonNullable<IconButtonSolid["color"]>,
    ColorStates
  > = {
    // Primary button
    primary: {
      background: {
        default: IOColorsLegacy[theme["interactiveElem-default"]],
        pressed: IOColorsLegacy[theme["interactiveElem-pressed"]],
        disabled: IOColorsLegacy[theme["interactiveElem-disabled"]]
      },
      icon: {
        default: IOColorsLegacy[theme["buttonText-default"]],
        disabled: IOColorsLegacy[theme["buttonText-disabled"]]
      }
    },
    contrast: {
      background: {
        default: IOColorsLegacy.white,
        pressed: IOColorsLegacy["blueIO-50"],
        disabled: hexToRgba(IOColorsLegacy.white, 0.25)
      },
      icon: {
        default: IOColorsLegacy["blueIO-500"],
        disabled: IOColorsLegacy["blueIO-500"]
      }
    }
  };

  const backgroundColorAnimationStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [
        mapColorStates[color].background.default,
        mapColorStates[color].background.pressed
      ]
    )
  }));

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={"button"}
      accessibilityState={{ disabled }}
      accessible={true}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ alignSelf: "flex-start" }}
      testID={testID}
    >
      <Animated.View
        style={[
          IOIconButtonStyles.button,
          IOIconButtonStyles.buttonSizeLarge,
          !disabled && !reducedMotion && scaleAnimatedStyle,
          !disabled && backgroundColorAnimationStyle,
          disabled
            ? { backgroundColor: mapColorStates[color]?.background?.disabled }
            : { backgroundColor: mapColorStates[color]?.background?.default }
        ]}
      >
        <AnimatedIcon
          allowFontScaling
          color={
            !disabled
              ? mapColorStates[color]?.icon?.default
              : mapColorStates[color]?.icon?.disabled
          }
          name={icon}
        />
      </Animated.View>
    </Pressable>
  );
};

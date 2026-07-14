import { GestureResponderEvent, Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion
} from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOIconButtonStyles } from "../../core";
import { hexToRgba, IOColors } from "../../core/IOColors";
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
        default: IOColors[theme["interactiveElem-default"]],
        pressed: IOColors[theme["interactiveElem-pressed"]],
        disabled: IOColors[theme["interactiveElem-disabled"]]
      },
      icon: {
        default: IOColors[theme["buttonText-default"]],
        disabled: IOColors[theme["buttonText-disabled"]]
      }
    },
    contrast: {
      background: {
        default: IOColors.white,
        pressed: IOColors["blueIO-50"],
        disabled: hexToRgba(IOColors.white, 0.25)
      },
      icon: {
        default: IOColors["blueIO-500"],
        disabled: IOColors["blueIO-500"]
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

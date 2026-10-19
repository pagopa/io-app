import { GestureResponderEvent, Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion
} from "react-native-reanimated";

import {
  AnimatedIcon,
  AnimatedIconWithColorTransition,
  IOIcons
} from "../../components/icons";
import { hexToRgba, IOColorsLegacy, IOIconButtonStyles } from "../../core";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";

export type IconButtonContained = WithTestID<{
  accessibilityHint?: string;
  accessibilityLabel: string;
  color?: "contrast" | "neutral" | "primary";
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
    pressed: string;
  };
};

const mapColorStates: Record<
  NonNullable<IconButtonContained["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    background: {
      default: hexToRgba(IOColorsLegacy["blueIO-500"], 0),
      pressed: hexToRgba(IOColorsLegacy["blueIO-500"], 0.15),
      disabled: "transparent"
    },
    icon: {
      default: IOColorsLegacy["blueIO-500"],
      pressed: IOColorsLegacy["blueIO-600"],
      disabled: hexToRgba(IOColorsLegacy["blueIO-500"], 0.25)
    }
  },
  // Neutral button
  neutral: {
    background: {
      default: IOColorsLegacy.white,
      pressed: IOColorsLegacy["grey-50"],
      disabled: "transparent"
    },
    icon: {
      default: IOColorsLegacy["grey-700"],
      pressed: IOColorsLegacy.black,
      disabled: IOColorsLegacy["grey-450"]
    }
  },
  // Contrast button
  contrast: {
    background: {
      default: hexToRgba(IOColorsLegacy.white, 0),
      pressed: hexToRgba(IOColorsLegacy.white, 0.2),
      disabled: "transparent"
    },
    icon: {
      default: IOColorsLegacy.white,
      pressed: IOColorsLegacy.white,
      disabled: hexToRgba(IOColorsLegacy.white, 0.25)
    }
  }
};

export const IconButtonContained = ({
  icon,
  color = "primary",
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: IconButtonContained) => {
  const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("exaggerated");
  const reducedMotion = useReducedMotion();

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

  // Animate the <Icon> color prop
  const iconColorAnimationStyle = useAnimatedProps(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [mapColorStates[color].icon.default, mapColorStates[color].icon.pressed]
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
          IOIconButtonStyles.buttonSizeDefault,
          !disabled && !reducedMotion && scaleAnimatedStyle,
          !disabled && backgroundColorAnimationStyle
        ]}
      >
        {!disabled ? (
          <AnimatedIconWithColorTransition
            animatedProps={iconColorAnimationStyle}
            color={mapColorStates[color]?.icon?.default}
            name={icon}
          />
        ) : (
          <AnimatedIcon
            color={mapColorStates[color]?.icon?.disabled}
            name={icon}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

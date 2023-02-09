import * as React from "react";
import { useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent
  // PixelRatio
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate,
  interpolateColor
} from "react-native-reanimated";
import { hexToRgba, IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { IOButtonStyles } from "../core/variables/IOStyles";
import { Icon, IOIconType } from "../core/icons";

export type IconButton = {
  icon: IOIconType;
  color?: "primary" | "neutral" | "contrast";
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
  onPress: (event: GestureResponderEvent) => void;
};

type ColorStates = {
  border: {
    default: string;
    pressed: string;
    disabled: string;
  };
  background: {
    default: string;
    pressed: string;
    disabled: string;
  };
  icon: {
    default: string;
    pressed: string;
    disabled: string;
  };
};

// COMPONENT CONFIGURATION

const mapColorStates: Record<NonNullable<IconButton["color"]>, ColorStates> = {
  // Primary button
  primary: {
    border: {
      default: IOColors.blue,
      pressed: IOColors.blue,
      disabled: IOColors.bluegreyLight
    },
    background: {
      default: hexToRgba(IOColors.blue, 0),
      pressed: hexToRgba(IOColors.blue, 0.15),
      disabled: "transparent"
    },
    icon: {
      default: IOColors.blue,
      pressed: IOColors.blue,
      disabled: hexToRgba(IOColors.blue, 0.25)
    }
  },
  // Neutral button
  neutral: {
    border: {
      default: IOColors.grey,
      pressed: IOColors.bluegrey,
      disabled: IOColors.bluegreyLight
    },
    background: {
      default: IOColors.white,
      pressed: IOColors.greyUltraLight,
      disabled: "transparent"
    },
    icon: {
      default: IOColors.bluegrey,
      pressed: IOColors.bluegreyDark,
      disabled: IOColors.grey
    }
  },
  // Contrast button
  contrast: {
    border: {
      default: IOColors.white,
      pressed: IOColors.white,
      disabled: hexToRgba(IOColors.white, 0.5)
    },
    background: {
      default: hexToRgba(IOColors.white, 0),
      pressed: hexToRgba(IOColors.white, 0.2),
      disabled: "transparent"
    },
    icon: {
      default: IOColors.white,
      pressed: IOColors.white,
      disabled: hexToRgba(IOColors.white, 0.25)
    }
  }
};

const IOIconButtonStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    textAlignVertical: "center", // Android
    justifyContent: "center",
    // Reset default visual parameters
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 0
  }
});

export const IconButton = ({
  icon,
  color = "primary",
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: IconButton) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.exaggeratedButton?.pressedState;

  // Using a spring-based animation for our interpolations
  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const pressedAnimationStyle = useAnimatedStyle(() => {
    // Link color states to the pressed states
    const backgroundColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapColorStates[color].background.default,
        mapColorStates[color].background.pressed
      ]
    );

    const borderColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapColorStates[color].border.default,
        mapColorStates[color].border.pressed
      ]
    );

    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      borderColor,
      backgroundColor,
      transform: [{ scale }]
    };
  });

  // const pressedColorLabelAnimationStyle = useAnimatedStyle(() => {
  //   // Link color states to the pressed states
  //   const labelColor = interpolateColor(
  //     progressPressed.value,
  //     [0, 1],
  //     [mapColorStates[color].icon.default, mapColorStates[color].icon.pressed]
  //   );

  //   return {
  //     color: labelColor
  //   };
  // });

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      disabled={disabled}
      style={IOButtonStyles.dimensionsDefault}
    >
      <Animated.View
        style={[
          IOIconButtonStyles.button,
          IOButtonStyles.iconButtonSizeDefault,
          disabled
            ? {
                backgroundColor: mapColorStates[color]?.background?.disabled
              }
            : {
                backgroundColor: mapColorStates[color]?.background?.default
              },
          /* Prevent Reanimated from overriding background colors
          if button is disabled */
          !disabled && pressedAnimationStyle
        ]}
      >
        <Icon
          name={icon}
          color={
            disabled
              ? mapColorStates[color]?.icon?.disabled
              : mapColorStates[color]?.icon?.default
          }
        />
      </Animated.View>
    </Pressable>
  );
};

export default IconButton;

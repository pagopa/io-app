import * as React from "react";
import { useCallback } from "react";
import { Pressable, GestureResponderEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import { Badge } from "../../../../components/core/Badge";
import { WithTestID } from "../../../../types/WithTestID";
import {
  IOScaleValues,
  IOSpringValues
} from "../../../../components/core/variables/IOAnimations";
import {
  IOButtonStyles,
  IOIconButtonStyles
} from "../../../../components/core/variables/IOStyles";

export type BadgeButton = WithTestID<
  {
    disabled?: boolean;
    // Accessibility
    accessibilityLabel: string;
    accessibilityHint?: string;
    // Events
    onPress: (event: GestureResponderEvent) => void;
  } & Badge
>;

export const BadgeButton = ({
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  text,
  variant
}: BadgeButton) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.exaggeratedButton?.pressedState;

  // Using a spring-based animation for our interpolations
  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values

  const pressedAnimationStyle = useAnimatedStyle(() => {
    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

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
      style={IOButtonStyles.dimensionsDefault}
      disabled={disabled}
      // Events
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      // Accessibility
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      // Usability
      // Add a touchable area around the button
      hitSlop={8}
      // Test
      testID={testID}
    >
      <Animated.View style={!disabled && pressedAnimationStyle}>
        <Badge text={text} variant={variant} />
      </Animated.View>
    </Pressable>
  );
};

export default BadgeButton;

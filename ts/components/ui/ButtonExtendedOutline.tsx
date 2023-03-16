import * as React from "react";
import { useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  GestureResponderEvent
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import { Icon, IOIcons } from "../core/icons";
import { IOStyles } from "../core/variables/IOStyles";
import { IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { H4 } from "../core/typography/H4";
import { LabelSmall } from "../core/typography/LabelSmall";

type Props = {
  label: string;
  description?: string;
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderColor: IOColors.bluegreyLight,
    backgroundColor: IOColors.white,
    borderStyle: "solid",
    borderWidth: 1
  }
});

export const ButtonExtendedOutline = ({
  label,
  description,
  onPress,
  icon = "info"
}: Props) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.magnifiedButton?.pressedState;

  const scaleTraversed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scaleTraversed.value,
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
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      accessibilityRole={"button"}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <View style={IOStyles.flex}>
          <H4>{label}</H4>
          {description && (
            <LabelSmall weight="Regular" color={"bluegreyDark"}>
              {description}
            </LabelSmall>
          )}
        </View>
        <View style={{ marginLeft: 8 }}>
          <Icon name={icon} color="blue" size={24} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default ButtonExtendedOutline;

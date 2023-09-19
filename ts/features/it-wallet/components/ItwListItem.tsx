import {
  H6,
  IOColors,
  IOIcons,
  IOListItemIDPHSpacing,
  IOListItemIDPRadius,
  IOListItemIDPVSpacing,
  IOListItemVisualParams,
  IOScaleValues,
  IOSpringValues,
  IOStyles,
  Icon,
  WithTestID,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  View
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate
} from "react-native-reanimated";

type ItwListItem = WithTestID<{
  label: string;
  numberOfLines?: number;
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
  rightNode?: React.ReactNode;
  disabled?: boolean;
  // Accessibility
  accessibilityLabel: string;
}>;

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: IOColors["grey-300"],
    borderRadius: IOListItemIDPRadius,
    backgroundColor: IOColors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: IOListItemIDPVSpacing,
    paddingHorizontal: IOListItemIDPHSpacing
  }
});

const DISABLED_OPACITY = 0.5;

export const ItwListItem = ({
  label,
  numberOfLines,
  onPress,
  icon,
  rightNode,
  testID,
  disabled = false,
  // Accessibility
  accessibilityLabel
}: ItwListItem) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);
  const theme = useIOTheme();

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

  const infoCopyText = (
    <H6 color={theme["interactiveElem-default"]} numberOfLines={numberOfLines}>
      {label}
    </H6>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          disabled ? { opacity: DISABLED_OPACITY } : {}
        ]}
      >
        {icon && (
          <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
            <Icon
              name={icon}
              color="grey-450"
              size={IOListItemVisualParams.iconSize}
            />
          </View>
        )}
        <View style={IOStyles.flex}>{infoCopyText}</View>
        <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
          {rightNode}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default ItwListItem;

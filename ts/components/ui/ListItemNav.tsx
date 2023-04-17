import * as React from "react";
import { useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  Text
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
import { Icon, IOIcons } from "../core/icons";
import { IOStyles } from "../core/variables/IOStyles";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
// import { useIOSelector } from "../../store/hooks";
import { makeFontStyleObject } from "../core/fonts";
// import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

export type ListItemNav = WithTestID<{
  value: string;
  description?: string;
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
  // Accessibility
  accessibilityLabel: string;
}>;

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: IOColors["grey-50"],
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: -24,
    marginLeft: -24
  },
  listItemInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  textValue: {
    fontSize: 18,
    lineHeight: 24,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});

const mapBackgroundStates = {
  default: hexToRgba(IOColors["grey-50"], 0),
  pressed: IOColors["grey-50"]
};

export const ListItemNav = ({
  value,
  description,
  onPress,
  icon,
  accessibilityLabel,
  testID
}: ListItemNav) => {
  // const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.basicButton?.pressedState;

  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const animatedScaleStyle = useAnimatedStyle(() => {
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

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [mapBackgroundStates.default, mapBackgroundStates.pressed]
    );

    return {
      backgroundColor
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
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
    >
      <Animated.View style={[styles.listItem, animatedBackgroundStyle]}>
        <Animated.View style={[styles.listItemInner, animatedScaleStyle]}>
          {icon && (
            <View style={{ marginRight: 16 }}>
              <Icon name={icon} color="grey-450" size={24} />
            </View>
          )}
          <View style={IOStyles.flex}>
            <Text
              style={[styles.textValue, { color: IOColors.bluegreyDark }]}
              numberOfLines={1}
            >
              {value}
            </Text>
            {description && (
              <LabelSmall weight="Regular" color={"bluegrey"}>
                {description}
              </LabelSmall>
            )}
          </View>
          <View style={{ marginLeft: 8 }}>
            <Icon name="chevronRightListItem" color="blue" size={24} />
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default ListItemNav;

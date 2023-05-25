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
import { AnimatedIcon, Icon, IOIcons } from "../core/icons";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { IOColors, hexToRgba, useIOTheme } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { useIOSelector } from "../../store/hooks";
import { makeFontStyleObject } from "../core/fonts";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

export type ListItemAction = WithTestID<{
  label: string;
  variant: "primary" | "danger";
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
  // Accessibility
  accessibilityLabel: string;
}>;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    lineHeight: 20,
    ...makeFontStyleObject("Regular", false, "ReadexPro")
  },
  /* REMOVE_LEGACY_COMPONENT: Start ▶ */
  labelLegacy: {
    fontSize: 18,
    lineHeight: 24,
    ...makeFontStyleObject("SemiBold", false, "TitilliumWeb")
  }
  /* REMOVE_LEGACY_COMPONENT: End ▶ */
});

export const ListItemAction = ({
  variant,
  label,
  onPress,
  icon,
  accessibilityLabel,
  testID
}: ListItemAction) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  const theme = useIOTheme();

  const mapBackgroundStates: Record<string, string> = {
    default: hexToRgba(IOColors[theme["listItem-pressed"]], 0),
    pressed: IOColors[theme["listItem-pressed"]]
  };

  /* REMOVE_LEGACY_COMPONENT: Start ▶ */
  const mapLegacyForegroundColor: Record<
    NonNullable<ListItemAction["variant"]>,
    IOColors
  > = {
    primary: "blue",
    danger: "error-850"
  };
  /* REMOVE_LEGACY_COMPONENT: End ▶ */

  const mapForegroundColor: Record<
    NonNullable<ListItemAction["variant"]>,
    string
  > = {
    primary: IOColors[theme["interactiveElem-default"]],
    danger: IOColors[theme.errorText]
  };

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

  /* ◀ REMOVE_LEGACY_COMPONENT: Start */
  const LegacyListItemAction = () => (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
    >
      <Animated.View
        style={[IOListItemStyles.listItem, animatedBackgroundStyle]}
      >
        <Animated.View
          style={[IOListItemStyles.listItemInner, animatedScaleStyle]}
        >
          {icon && (
            <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
              <Icon
                name={icon}
                color={mapLegacyForegroundColor[variant]}
                size={IOListItemVisualParams.iconSize}
              />
            </View>
          )}
          <View style={IOStyles.flex}>
            <Text
              style={[
                styles.labelLegacy,
                { color: IOColors[mapLegacyForegroundColor[variant]] }
              ]}
            >
              {label}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
  /* REMOVE_LEGACY_COMPONENT: End ▶ */

  const NewListItemAction = () => (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
    >
      <Animated.View
        style={[IOListItemStyles.listItem, animatedBackgroundStyle]}
      >
        <Animated.View
          style={[IOListItemStyles.listItemInner, animatedScaleStyle]}
        >
          {icon && (
            <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
              <AnimatedIcon
                name={icon}
                color={mapForegroundColor[variant] as IOColors}
                size={IOListItemVisualParams.iconSize}
              />
            </View>
          )}
          <View style={IOStyles.flex}>
            <Text
              style={[styles.label, { color: mapForegroundColor[variant] }]}
            >
              {label}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );

  /* ◀ REMOVE_LEGACY_COMPONENT: Move the entire <NewListItemAction /> here,
  without the following condition */
  return isDesignSystemEnabled ? (
    <NewListItemAction />
  ) : (
    <LegacyListItemAction />
  );
};

export default ListItemAction;

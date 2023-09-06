import {
  ListItemAction as DSListItemAction,
  IOColors,
  IOIcons,
  Icon,
  hexToRgba,
  useIOTheme,
  IOScaleValues,
  IOSpringValues
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { WithTestID } from "../../types/WithTestID";
import { makeFontStyleObject } from "../core/fonts";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";

export type ListItemAction = WithTestID<{
  label: string;
  variant: "primary" | "danger";
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
  // Accessibility
  accessibilityLabel: string;
}>;

const styles = StyleSheet.create({
  labelLegacy: {
    fontSize: 18,
    lineHeight: 24,
    ...makeFontStyleObject("SemiBold", false, "TitilliumWeb")
  }
});

/**
 *
 * A button-like component used in a list item to perform actions.
 * Currently if the Design System is enabled, the component returns the ListItemAction of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param {string} variant - The variant of the ListItemAction, can be "primary" or "danger".
 * @param {string} label - The label text displayed in the ListItemAction.
 * @param {function} onPress - The callback function to be executed when the ListItemAction is pressed.
 * @param {string} icon - The name of the icon to be displayed in the ListItemAction.
 * @param {string} accessibilityLabel - The accessibility label for the ListItemAction.
 * @param {string} testID - The testID for automated testing.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ListItemAction of the @pagopa/io-app-design-system library.
 *
 */
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

  const mapLegacyForegroundColor: Record<
    NonNullable<ListItemAction["variant"]>,
    IOColors
  > = {
    primary: "blue",
    danger: "error-850"
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

  return isDesignSystemEnabled ? (
    <DSListItemAction
      label={label}
      variant={variant}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      icon={icon}
      testID={testID}
    />
  ) : (
    <LegacyListItemAction />
  );
};

export default ListItemAction;

import {
  ListItemInfoCopy as DSListItemInfoCopy,
  IOColors,
  IOIcons,
  Icon,
  hexToRgba,
  useIOTheme,
  VSpacer
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
import { Body } from "../core/typography/Body";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";

export type ListItemInfoCopy = WithTestID<{
  label: string;
  value: string | React.ReactNode;
  numberOfLines?: number;
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
  // Accessibility
  accessibilityLabel: string;
}>;

const styles = StyleSheet.create({
  textValue: {
    fontSize: 18,
    lineHeight: 24,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});

/**
 *
 * Represents a list item with label and value information, and an optional copy icon for copying the value.
 * It supports onPress event for the copy icon.
 * Currently if the Design System is enabled, the component returns the ListItemInfoCopy of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param {string|JSX.Element} label - The label or JSX element to display as the item's label.
 * @param {string|JSX.Element} value - The value or JSX element to display as the item's value.
 * @param {number} [numberOfLines=2] - The maximum number of lines to display for the value.
 * @param {function} onPress - The function to be executed when the copy icon is pressed.
 * @param {string} icon - The name of the icon to display (if any).
 * @param {string} accessibilityLabel - The accessibility label for the item.
 * @param {string} testID - The test ID for testing purposes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ListItemInfoCopy of the @pagopa/io-app-design-system library.
 *
 */
export const ListItemInfoCopy = ({
  label,
  value,
  numberOfLines = 2,
  onPress,
  icon,
  accessibilityLabel,
  testID
}: ListItemInfoCopy) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  const theme = useIOTheme();

  const mapBackgroundStates: Record<string, string> = {
    default: hexToRgba(IOColors[theme["listItem-pressed"]], 0),
    pressed: IOColors[theme["listItem-pressed"]]
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

  const LegacyListItemInfoCopy = () => (
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
              <Icon
                name={icon}
                color="grey-450"
                size={IOListItemVisualParams.iconSize}
              />
            </View>
          )}
          <View style={IOStyles.flex}>
            <Body weight="Regular">{label}</Body>
            <VSpacer size={4} />
            {/* Let developer using a custom component (e.g: skeleton) */}
            {typeof value === "string" ? (
              <Text
                style={[styles.textValue, { color: IOColors.blue }]}
                numberOfLines={numberOfLines}
              >
                {value}
              </Text>
            ) : (
              { value }
            )}
          </View>
          <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
            <Icon
              name="copy"
              color="blue"
              size={IOListItemVisualParams.chevronSize}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );

  return isDesignSystemEnabled ? (
    <DSListItemInfoCopy
      label={label}
      value={value}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      icon={icon}
      numberOfLines={numberOfLines}
      testID={testID}
    />
  ) : (
    <LegacyListItemInfoCopy />
  );
};

export default ListItemInfoCopy;

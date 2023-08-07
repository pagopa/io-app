import {
  ListItemNavAlert as DSListItemNavAlert,
  Icon
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
import { IOColors, hexToRgba, useIOTheme } from "../core/variables/IOColors";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";

export type ListItemNavAlert = WithTestID<{
  value: string;
  description?: string;
  withoutIcon?: boolean;
  onPress: (event: GestureResponderEvent) => void;
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
 * Represents a navigable list item with an alert icon, label, and description.
 * It supports an onPress event for handling item navigation.
 * Currently if the Design System is enabled, the component returns the ListItemNavAlert of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param {string} value - The label to display as the item's value.
 * @param {string} description - The description to display as the item's description.
 * @param {boolean} withoutIcon - If true, the alert icon will not be displayed.
 * @param {function} onPress - The function to be executed when the item is pressed.
 * @param {string} accessibilityLabel - The accessibility label for the item.
 * @param {string} testID - The test ID for testing purposes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ListItemNavAlert of the @pagopa/io-app-design-system library.
 *
 */
export const ListItemNavAlert = ({
  value,
  description,
  withoutIcon = false,
  onPress,
  accessibilityLabel,
  testID
}: ListItemNavAlert) => {
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

  const LegacyListItemNavAlert = () => (
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
          {!withoutIcon && (
            <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
              <Icon
                name="errorFilled"
                color={theme.errorIcon}
                size={IOListItemVisualParams.iconSize}
              />
            </View>
          )}
          <View style={IOStyles.flex}>
            <Text style={[styles.textValue, { color: IOColors.bluegreyDark }]}>
              {value}
            </Text>
            {description && (
              <Body weight="SemiBold" color={theme.errorText}>
                {description}
              </Body>
            )}
          </View>
          <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
            <Icon
              name="chevronRightListItem"
              color="blue"
              size={IOListItemVisualParams.chevronSize}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );

  return isDesignSystemEnabled ? (
    <DSListItemNavAlert
      value={value}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      description={description}
      withoutIcon={withoutIcon}
    />
  ) : (
    <LegacyListItemNavAlert />
  );
};

export default ListItemNavAlert;

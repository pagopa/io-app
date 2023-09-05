import {
  ListItemNav as DSListItemNav,
  IOColors,
  IOIcons,
  Icon,
  hexToRgba,
  useIOTheme
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

export type ListItemNav = WithTestID<{
  value: string | React.ReactNode;
  description?: string | React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
  // Accessibility
  accessibilityLabel: string;
}>;

const styles = StyleSheet.create({
  textValue: {
    fontSize: 18,
    lineHeight: 24,
    color: IOColors.bluegreyDark,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});

/**
 *
 * Represents a navigable list item with a label, description, and a chevron icon for navigation.
 * It supports an onPress event for handling item navigation.
 * Currently if the Design System is enabled, the component returns the ListItemNav of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param {string|JSX.Element} value - The label or JSX element to display as the item's label.
 * @param {string|JSX.Element} description - The description or JSX element to display as the item's description.
 * @param {function} onPress - The function to be executed when the item is pressed.
 * @param {string} icon - The name of the icon to display (if any).
 * @param {string} accessibilityLabel - The accessibility label for the item.
 * @param {string} testID - The test ID for testing purposes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ListItemNav of the @pagopa/io-app-design-system library.
 *
 */
export const ListItemNav = ({
  value,
  description,
  onPress,
  icon,
  accessibilityLabel,
  testID
}: ListItemNav) => {
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

  const LegacyListItemNav = () => (
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
                color="grey-450"
                size={IOListItemVisualParams.iconSize}
              />
            </View>
          )}
          <View style={IOStyles.flex}>
            {/* Let developer using a custom component (e.g: skeleton) */}
            {typeof value === "string" ? (
              <Text style={styles.textValue}>{value}</Text>
            ) : (
              value
            )}
            {description && (
              <>
                {typeof description === "string" ? (
                  <Body weight="Regular">{description}</Body>
                ) : (
                  description
                )}
              </>
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
    <DSListItemNav
      value={value}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      description={description}
      icon={icon}
      testID={testID}
    />
  ) : (
    <LegacyListItemNav />
  );
};

export default ListItemNav;

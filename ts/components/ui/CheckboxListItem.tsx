import { IOIcons, Icon, ListItemCheckbox } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
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
import { makeFontStyleObject } from "../core/fonts";
import { AnimatedCheckbox } from "../core/selection/checkbox/AnimatedCheckbox";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import { IOColors, hexToRgba, useIOTheme } from "../core/variables/IOColors";
import {
  IOSelectionListItemStyles,
  IOSelectionListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";

type Props = {
  value: string;
  description?: string;
  icon?: IOIcons;
  selected?: boolean;
  // dispatch the new value after the checkbox changes state
  onValueChange?: (newValue: boolean) => void;
};

const DISABLED_OPACITY = 0.5;

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Props &
  Pick<
    React.ComponentProps<typeof Pressable>,
    "onPress" | "accessibilityLabel" | "disabled"
  >;

const styles = StyleSheet.create({
  legacyTextValue: {
    fontSize: 18,
    lineHeight: 24,
    color: IOColors.bluegreyDark,
    flexShrink: 1,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});

/**
 *
 * A custom checkbox-like list item that can be toggled on and off.
 * Currently if the Design System is enabled, the component returns the ListItemCheckbox of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 *
 * @param {string} value - The value of the list item.
 * @param {string} description - The description of the list item.
 * @param {string} icon - The name of the icon to be displayed in the list item.
 * @param {boolean} selected - Indicates whether the list item is currently selected.
 * @param {boolean} disabled - Indicates whether the list item is disabled.
 * @param {function} onValueChange - The callback function to be executed when the value changes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ListItemCheckbox of the @pagopa/io-app-design-system library.
 *
 */
export const CheckboxListItem = ({
  value,
  description,
  icon,
  selected,
  disabled,
  onValueChange
}: OwnProps) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const [toggleValue, setToggleValue] = useState(selected ?? false);
  // Animations
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.basicButton?.pressedState;

  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Theme
  const theme = useIOTheme();

  const mapBackgroundStates: Record<string, string> = {
    default: hexToRgba(IOColors[theme["listItem-pressed"]], 0),
    pressed: IOColors[theme["listItem-pressed"]]
  };

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

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

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

  const toggleCheckbox = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setToggleValue(!toggleValue);
    if (onValueChange !== undefined) {
      onValueChange(!toggleValue);
    }
  };

  return isDesignSystemEnabled ? (
    <ListItemCheckbox
      value={value}
      disabled={disabled}
      description={description}
      icon={icon}
      selected={selected}
      onValueChange={onValueChange}
    />
  ) : (
    <Pressable
      onPress={toggleCheckbox}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID="AnimatedCheckbox"
      disabled={disabled}
    >
      <Animated.View
        style={[
          IOSelectionListItemStyles.listItem,
          animatedBackgroundStyle,
          { opacity: disabled ? DISABLED_OPACITY : 1 }
        ]}
        // This is required to avoid opacity
        // inheritance on Android
        needsOffscreenAlphaCompositing={true}
      >
        <Animated.View style={animatedScaleStyle}>
          <View style={IOSelectionListItemStyles.listItemInner}>
            <View style={[IOStyles.row, { flexShrink: 1 }]}>
              {icon && (
                <View
                  style={{
                    marginRight: IOSelectionListItemVisualParams.iconMargin
                  }}
                >
                  <Icon
                    name={icon}
                    color="grey-300"
                    size={IOSelectionListItemVisualParams.iconSize}
                  />
                </View>
              )}
              <Text style={styles.legacyTextValue}>{value}</Text>
            </View>
            <HSpacer size={8} />
            <View pointerEvents="none">
              <AnimatedCheckbox checked={selected ?? toggleValue} />
            </View>
          </View>
          {description && (
            <View>
              <VSpacer
                size={IOSelectionListItemVisualParams.descriptionMargin}
              />
              <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
                {description}
              </LabelSmall>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

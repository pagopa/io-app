import * as React from "react";
import { useCallback, useState } from "react";
import { Pressable, View, StyleSheet, Text } from "react-native";
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
import { NewH6 } from "../core/typography/NewH6";
import {
  IOSelectionItemStyles,
  IOSelectionItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { AnimatedCheckbox } from "../core/selection/checkbox/AnimatedCheckbox";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOColors, hexToRgba, useIOTheme } from "../core/variables/IOColors";
import { IOIcons, Icon } from "../core/icons";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { makeFontStyleObject } from "../core/fonts";

type Props = {
  value: string;
  description?: string;
  icon?: IOIcons;
  // dispatch the new value after the checkbox changes state
  onValueChange?: (newValue: boolean) => void;
};

const DISABLED_OPACITY = 0.5;

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Props &
  Pick<React.ComponentProps<typeof AnimatedCheckbox>, "checked"> &
  Pick<
    React.ComponentProps<typeof Pressable>,
    "onPress" | "accessibilityLabel" | "disabled"
  >;

/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
const styles = StyleSheet.create({
  legacyTextValue: {
    fontSize: 18,
    lineHeight: 24,
    color: IOColors.bluegreyDark,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  }
});
/* REMOVE_LEGACY_COMPONENT: End ▶ */

/**
 *  with the automatic state management that uses a {@link AnimatedCheckBox}
 * The toggleValue change when a `onPress` event is received and dispatch the `onValueChange`.
 *
 * @param props
 * @constructor
 */
export const CheckboxListItem = ({
  value,
  description,
  icon,
  checked,
  disabled,
  onValueChange
}: OwnProps) => {
  // Experimental Design System
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const [toggleValue, setToggleValue] = useState(checked ?? false);
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

  return (
    <Pressable
      onPress={toggleCheckbox}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID="AnimatedCheckbox"
      disabled={disabled}
      style={{
        opacity: disabled ? DISABLED_OPACITY : 1
      }}
    >
      <Animated.View
        style={[IOSelectionItemStyles.listItem, animatedBackgroundStyle]}
      >
        <Animated.View style={animatedScaleStyle}>
          <View style={IOSelectionItemStyles.listItemInner}>
            <View style={IOStyles.row}>
              {icon && (
                <View
                  style={{
                    marginRight: IOSelectionItemVisualParams.iconMargin
                  }}
                >
                  <Icon
                    name={icon}
                    color="grey-300"
                    size={IOSelectionItemVisualParams.iconSize}
                  />
                </View>
              )}
              {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */}
              {isDesignSystemEnabled ? (
                <NewH6 color={"black"}>{value}</NewH6>
              ) : (
                <Text style={styles.legacyTextValue}>{value}</Text>
              )}
              {/* REMOVE_LEGACY_COMPONENT: End ▶ */}
            </View>
            <HSpacer size={8} />
            <View pointerEvents="none">
              <AnimatedCheckbox checked={checked ?? toggleValue} />
            </View>
          </View>
          {description && (
            <View>
              <VSpacer size={4} />
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

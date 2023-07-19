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
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { LabelSmall } from "../core/typography/LabelSmall";
import { IOColors, hexToRgba, useIOTheme } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { useIOSelector } from "../../store/hooks";
import { makeFontStyleObject } from "../core/fonts";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { NewH6 } from "../core/typography/NewH6";
import { Body } from "../core/typography/Body";
import { VSpacer } from "../core/spacer/Spacer";

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

  /* ◀ REMOVE_LEGACY_COMPONENT: Start */
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
  /* REMOVE_LEGACY_COMPONENT: End ▶ */

  const NewListItemInfoCopy = () => (
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
            <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
              {label}
            </LabelSmall>
            {/* Let developer using a custom component (e.g: skeleton) */}
            {typeof value === "string" ? (
              <NewH6
                color={theme["interactiveElem-default"]}
                numberOfLines={numberOfLines}
              >
                {value}
              </NewH6>
            ) : (
              { value }
            )}
          </View>
          <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
            <Icon
              name="copy"
              color={theme["interactiveElem-default"]}
              size={IOListItemVisualParams.chevronSize}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );

  /* ◀ REMOVE_LEGACY_COMPONENT: Move the entire <NewListItemNav /> here,
  without the following condition */
  return isDesignSystemEnabled ? (
    <NewListItemInfoCopy />
  ) : (
    <LegacyListItemInfoCopy />
  );
};

export default ListItemInfoCopy;

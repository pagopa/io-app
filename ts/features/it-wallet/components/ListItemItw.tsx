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
  LabelSmall,
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

type ListItemItw = WithTestID<{
  title: string;
  subTitle?: string;
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

/**
 * Components which renders a list item for the IT-WALLET stream.
 * It supports an optional left icon, a title, an optional subtitle and an optional right node.
 * It also supports a disabled state which greys out the component and disables the onPress callback.
 */
export const ListItemItw = ({
  title,
  subTitle,
  numberOfLines,
  onPress,
  icon,
  rightNode,
  testID,
  disabled = false,
  // Accessibility
  accessibilityLabel
}: ListItemItw) => {
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

  const renderTitle = (
    <H6 color={theme["interactiveElem-default"]} numberOfLines={numberOfLines}>
      {title}
    </H6>
  );

  const renderSubTitle = subTitle && (
    <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
      {subTitle}
    </LabelSmall>
  );

  const renderRightNode = rightNode && (
    <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
      {rightNode}
    </View>
  );

  const renderIcon = icon && (
    <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
      <Icon
        name={icon}
        color="grey-450"
        size={IOListItemVisualParams.iconSize}
      />
    </View>
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
        {renderIcon}
        <View style={IOStyles.flex}>
          {renderTitle}
          {renderSubTitle}
        </View>
        {renderRightNode}
      </Animated.View>
    </Pressable>
  );
};

export default ListItemItw;

import React, { ComponentProps, memo, useCallback } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import {
  AvatarSearch,
  AvatarSearchProps,
  H6,
  IOColors,
  IOListItemStyles,
  IOListItemVisualParams,
  IOScaleValues,
  IOSpringValues,
  IOStyles,
  Icon,
  BodySmall,
  WithTestID,
  hexToRgba,
  useIOExperimentalDesign,
  useIOTheme
} from "@pagopa/io-app-design-system";

export type ListItemSearchInstitutionProps = WithTestID<
  {
    value: string | React.ReactNode;
    avatarProps: AvatarSearchProps;
    /**
     * The maximum number of lines to display for the value.
     */
    numberOfLines?: number;
    description?: string | React.ReactNode;
    onPress: (event: GestureResponderEvent) => void;
  } & Pick<
    ComponentProps<typeof Pressable>,
    "accessibilityLabel" | "accessibilityHint"
  >
>;

export const ListItemSearchInstitution = memo(
  ({
    value,
    description,
    onPress,
    avatarProps: avatar,
    accessibilityLabel,
    accessibilityHint,
    testID,
    numberOfLines
  }: ListItemSearchInstitutionProps) => {
    const isPressed = useSharedValue(0);
    const { isExperimental } = useIOExperimentalDesign();
    const theme = useIOTheme();

    const listItemSearchInstitutionContent = (
      <>
        {/* Let developer using a custom component (e.g: skeleton) */}
        {typeof value === "string" ? (
          <H6 color={theme["textBody-default"]} numberOfLines={numberOfLines}>
            {value}
          </H6>
        ) : (
          value
        )}
        {description && (
          <>
            {typeof description === "string" ? (
              <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
                {description}
              </BodySmall>
            ) : (
              description
            )}
          </>
        )}
      </>
    );

    const mapBackgroundStates: Record<string, string> = {
      default: hexToRgba(IOColors[theme["listItem-pressed"]], 0),
      pressed: IOColors[theme["listItem-pressed"]]
    };

    const navIconColor = isExperimental
      ? theme["interactiveElem-default"]
      : "blue";

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

    const handlePressIn = useCallback(() => {
      // eslint-disable-next-line functional/immutable-data
      isPressed.value = 1;
    }, [isPressed]);

    const handlePressOut = useCallback(() => {
      // eslint-disable-next-line functional/immutable-data
      isPressed.value = 0;
    }, [isPressed]);

    const handleOnPress = useCallback(
      (event: GestureResponderEvent) => onPress(event),
      [onPress]
    );

    return (
      <Pressable
        onPress={handleOnPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        testID={testID}
      >
        <Animated.View
          style={[IOListItemStyles.listItem, animatedBackgroundStyle]}
        >
          <Animated.View
            style={[IOListItemStyles.listItemInner, animatedScaleStyle]}
          >
            <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
              <AvatarSearch {...avatar} />
            </View>
            <View style={IOStyles.flex}>
              {listItemSearchInstitutionContent}
            </View>
            <Icon
              name="chevronRightListItem"
              color={navIconColor}
              size={IOListItemVisualParams.chevronSize}
            />
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }
);

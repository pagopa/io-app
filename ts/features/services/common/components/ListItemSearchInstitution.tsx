import {
  AvatarSearch,
  AvatarSearchProps,
  BodySmall,
  H6,
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles,
  Icon,
  WithTestID,
  useIOExperimentalDesign,
  useIOTheme,
  useListItemAnimation
} from "@pagopa/io-app-design-system";
import React, { ComponentProps, memo, useCallback } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

export type ListItemSearchInstitution = WithTestID<
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
  }: ListItemSearchInstitution) => {
    const { isExperimental } = useIOExperimentalDesign();
    const theme = useIOTheme();

    const {
      onPressIn,
      onPressOut,
      scaleAnimatedStyle,
      backgroundAnimatedStyle
    } = useListItemAnimation();

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

    const navIconColor = isExperimental
      ? theme["interactiveElem-default"]
      : "blue";

    const handleOnPress = useCallback(
      (event: GestureResponderEvent) => onPress(event),
      [onPress]
    );

    return (
      <Pressable
        onPress={handleOnPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onTouchEnd={onPressOut}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        testID={testID}
      >
        <Animated.View
          style={[IOListItemStyles.listItem, backgroundAnimatedStyle]}
        >
          <Animated.View
            style={[IOListItemStyles.listItemInner, scaleAnimatedStyle]}
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

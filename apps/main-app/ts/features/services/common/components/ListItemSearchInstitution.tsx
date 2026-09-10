import {
  AvatarSearch,
  AvatarSearchProps,
  BodySmall,
  H6,
  Icon,
  IOListItemStyles,
  IOListItemVisualParams,
  useIOTheme,
  useListItemAnimation,
  WithTestID
} from "@io-app/design-system";
import { ComponentProps, memo, ReactNode, useCallback } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

export type ListItemSearchInstitution = WithTestID<
  Pick<
    ComponentProps<typeof Pressable>,
    "accessibilityHint" | "accessibilityLabel"
  > & {
    avatarProps: AvatarSearchProps;
    description?: ReactNode | string;
    /**
     * The maximum number of lines to display for the value.
     */
    numberOfLines?: number;
    onPress: (event: GestureResponderEvent) => void;
    value: ReactNode | string;
  }
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
              <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
                {description}
              </BodySmall>
            ) : (
              description
            )}
          </>
        )}
      </>
    );

    const handleOnPress = useCallback(
      (event: GestureResponderEvent) => onPress(event),
      [onPress]
    );

    return (
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessible={true}
        onPress={handleOnPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onTouchEnd={onPressOut}
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
            <View style={{ flex: 1 }}>{listItemSearchInstitutionContent}</View>
            <Icon
              color={theme["interactiveElem-default"]}
              name="chevronRightListItem"
              size={IOListItemVisualParams.chevronSize}
            />
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }
);

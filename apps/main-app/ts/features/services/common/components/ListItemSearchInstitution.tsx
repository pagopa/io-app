import {
  AvatarSearch,
  AvatarSearchProps,
  BodySmall,
  H6,
  HStack,
  Icon,
  IODimensions,
  IOListItemStyles,
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
    /** The maximum number of lines to display for the value. */
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
            <HStack
              allowScaleSpacing
              space={IODimensions.gap.listItem.leading}
              style={{ flex: 1, alignItems: "center" }}
            >
              <AvatarSearch {...avatar} />
              <View style={{ flex: 1 }}>
                {listItemSearchInstitutionContent}
              </View>
            </HStack>
            <Icon
              color={theme["interactiveElem-default"]}
              name="chevronRightListItem"
              size={IODimensions.size.icon.chevron}
            />
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }
);

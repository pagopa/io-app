import { ComponentProps, ReactNode } from "react";
import { GestureResponderEvent, Image, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOColorsLegacy, IODimensions, IOListItemStyles } from "../../core";
import { triggerHaptic } from "../../functions";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Icon, IOIcons } from "../icons";
import { HSpacer, VSpacer } from "../layout";
import { LoadingSpinner } from "../loadingSpinner";
import { BodySmall, Caption, H6 } from "../typography";

export type ListItemNav = ListItemNavGraphicProps & ListItemNavPartialProps;

export type ListItemNavGraphicProps =
  | {
      avatarProps: Omit<ComponentProps<typeof Avatar>, "size">;
      icon?: never;
      iconColor?: never;
      paymentLogoUri?: never;
    }
  | {
      avatarProps?: never;
      icon: IOIcons;
      iconColor?: IOColorsLegacy;
      paymentLogoUri?: never;
    }
  | {
      avatarProps?: never;
      icon?: never;
      iconColor?: never;
      paymentLogoUri: string;
    }
  | {
      avatarProps?: never;
      icon?: never;
      iconColor?: never;
      paymentLogoUri?: never;
    };

type ListItemNavPartialProps = WithTestID<
  Pick<
    ComponentProps<typeof Pressable>,
    "accessibilityHint" | "accessibilityLabel"
  > & {
    description?: ReactNode | string;
    hideChevron?: boolean;
    loading?: boolean;
    /** The maximum number of lines to display for the value. */
    numberOfLines?: number;
    onPress: (event: GestureResponderEvent) => void;
    topElement?: ListItemTopElementProps;
    value: ReactNode | string;
  }
>;

type ListItemTopElementProps =
  | {
      badgeProps: ComponentProps<typeof Badge>;
      dateValue?: never;
    }
  | {
      badgeProps?: never;
      dateValue: string;
    };

export const ListItemNav = ({
  value,
  description,
  onPress,
  icon,
  iconColor,
  avatarProps: avatar,
  paymentLogoUri,
  accessibilityLabel,
  accessibilityHint,
  testID,
  hideChevron = false,
  topElement,
  loading,
  numberOfLines
}: ListItemNav) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();
  const theme = useIOTheme();

  const defaultIconColor = iconColor ?? theme["icon-decorative"];
  const interactiveColor = theme["interactiveElem-default"];

  const { dynamicFontScale, hugeFontEnabled } = useIOFontDynamicScale();

  const listItemNavContent = (
    <>
      {topElement && (
        <>
          {topElement.badgeProps && (
            <>
              <View style={{ alignSelf: "flex-start" }}>
                <Badge {...topElement.badgeProps} />
              </View>
              <VSpacer size={IODimensions.gap.listItem.default.topElement} />
            </>
          )}
          {topElement.dateValue && (
            <>
              <View style={{ alignSelf: "flex-start", flexDirection: "row" }}>
                <Icon
                  allowFontScaling
                  color={theme["icon-decorative"]}
                  name="calendar"
                  size={IODimensions.size.icon.caption}
                />
                <HSpacer size={IODimensions.gap.listItem.default.caption} />
                <Caption color={theme["textBody-tertiary"]}>
                  {topElement.dateValue}
                </Caption>
              </View>
              <VSpacer size={IODimensions.gap.listItem.default.topElement} />
            </>
          )}
        </>
      )}
      {/* Let developer using a custom component (e.g: skeleton) */}
      {typeof value === "string" ? (
        <H6 color={theme["textBody-default"]} numberOfLines={numberOfLines}>
          {value}
        </H6>
      ) : (
        value
      )}
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- ReactNode: "" and false mean nothing to render */}
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

  const handleOnPress = (event: GestureResponderEvent) => {
    if (!loading) {
      triggerHaptic("impactLight");
      onPress(event);
    }
  };

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: loading }}
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
          {/* Possibile graphical assets
          - Icon
          - Image URL (for payment logos)
          - Avatar
          */}
          {icon && !hugeFontEnabled && (
            <>
              <Icon
                allowFontScaling
                color={defaultIconColor}
                name={icon}
                size={IODimensions.size.icon.listItem}
              />
              <HSpacer
                allowScaleSpacing
                size={IODimensions.gap.listItem.default.leading}
              />
            </>
          )}
          {paymentLogoUri && (
            <>
              <Image
                accessibilityIgnoresInvertColors
                source={{ uri: paymentLogoUri }}
                style={{
                  width: IODimensions.size.icon.listItem * dynamicFontScale,
                  height: IODimensions.size.icon.listItem * dynamicFontScale
                }}
              />
              <HSpacer
                allowScaleSpacing
                size={IODimensions.gap.listItem.default.leading}
              />
            </>
          )}
          {avatar && (
            <>
              <Avatar size="small" {...avatar} />
              <HSpacer
                allowScaleSpacing
                size={IODimensions.gap.listItem.default.leading}
              />
            </>
          )}

          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            {listItemNavContent}
          </View>
          {loading && (
            <LoadingSpinner color={IOColorsLegacy[interactiveColor]} />
          )}
          {!loading && !hideChevron && (
            <Icon
              allowFontScaling
              color={interactiveColor}
              name="chevronRightListItem"
              size={IODimensions.size.icon.chevron}
            />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

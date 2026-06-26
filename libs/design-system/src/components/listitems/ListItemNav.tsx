import { ComponentProps, ReactNode } from "react";
import { GestureResponderEvent, Image, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { useIOTheme } from "../../context";
import {
  IOColors,
  IOListItemStyles,
  IOListItemVisualParams,
  IOSelectionListItemVisualParams,
  IOSpacer,
  IOVisualCostants
} from "../../core";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { IOIcons, Icon } from "../icons";
import { HSpacer, VSpacer } from "../layout";
import { LoadingSpinner } from "../loadingSpinner";
import { BodySmall, Caption, H6 } from "../typography";

type ListItemTopElementProps =
  | {
      badgeProps: ComponentProps<typeof Badge>;
      dateValue?: never;
    }
  | {
      badgeProps?: never;
      dateValue: string;
    };

type ListItemNavPartialProps = WithTestID<
  {
    value: string | ReactNode;
    /**
     * The maximum number of lines to display for the value.
     */
    numberOfLines?: number;
    description?: string | ReactNode;
    loading?: boolean;
    onPress: (event: GestureResponderEvent) => void;
    hideChevron?: boolean;
    topElement?: ListItemTopElementProps;
  } & Pick<
    ComponentProps<typeof Pressable>,
    "accessibilityLabel" | "accessibilityHint"
  >
>;

export type ListItemNavGraphicProps =
  | {
      avatarProps: Omit<ComponentProps<typeof Avatar>, "size">;
      icon?: never;
      iconColor?: never;
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
      icon: IOIcons;
      iconColor?: IOColors;
      paymentLogoUri?: never;
    }
  | {
      avatarProps?: never;
      icon?: never;
      iconColor?: never;
      paymentLogoUri?: never;
    };

export type ListItemNav = ListItemNavPartialProps & ListItemNavGraphicProps;

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
              <VSpacer size={8} />
            </>
          )}
          {topElement.dateValue && (
            <>
              <View style={{ alignSelf: "flex-start", flexDirection: "row" }}>
                <Icon
                  allowFontScaling
                  name="calendar"
                  size={16}
                  color="grey-300"
                />
                <HSpacer size={4} />
                <Caption color={theme["textBody-tertiary"]}>
                  {topElement.dateValue}
                </Caption>
              </View>
              <VSpacer size={4} />
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

  const handleOnPress = (event: GestureResponderEvent) => {
    if (!loading) {
      onPress(event);
    }
  };

  return (
    <Pressable
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessible={true}
      accessibilityState={{ busy: loading }}
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
          {/* Possibile graphical assets
          - Icon
          - Image URL (for payment logos)
          - Avatar
          */}
          {icon && !hugeFontEnabled && (
            <>
              <Icon
                allowFontScaling
                name={icon}
                color={defaultIconColor}
                size={IOListItemVisualParams.iconSize}
              />
              <HSpacer
                allowScaleSpacing
                size={IOVisualCostants.iconMargin as IOSpacer}
              />
            </>
          )}
          {paymentLogoUri && (
            <>
              <Image
                accessibilityIgnoresInvertColors
                source={{ uri: paymentLogoUri }}
                style={{
                  width:
                    IOSelectionListItemVisualParams.iconSize * dynamicFontScale,
                  height:
                    IOSelectionListItemVisualParams.iconSize * dynamicFontScale
                }}
              />
              <HSpacer
                allowScaleSpacing
                size={IOVisualCostants.iconMargin as IOSpacer}
              />
            </>
          )}
          {avatar && (
            <>
              <Avatar size="small" {...avatar} />
              <HSpacer
                allowScaleSpacing
                size={IOVisualCostants.iconMargin as IOSpacer}
              />
            </>
          )}

          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            {listItemNavContent}
          </View>
          {loading && <LoadingSpinner color={IOColors[interactiveColor]} />}
          {!loading && !hideChevron && (
            <Icon
              allowFontScaling
              name="chevronRightListItem"
              color={interactiveColor}
              size={IOListItemVisualParams.chevronSize}
            />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

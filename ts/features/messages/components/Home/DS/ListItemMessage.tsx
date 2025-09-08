import {
  AnimatedMessageCheckbox,
  Avatar,
  BodySmall,
  H6,
  hexToRgba,
  HStack,
  IOColors,
  IOListItemStyles,
  IOVisualCostants,
  Tag,
  useIOTheme,
  useIOThemeContext,
  useListItemAnimation,
  WithTestID
} from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import {
  ColorValue,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import I18n from "i18next";
import { AvatarDouble } from "./AvatarDouble";

export const ListItemMessageStandardHeight = 95;
export const ListItemMessageEnhancedHeight = 133;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16
  },
  organizationContainer: {
    flexDirection: "row"
  },
  messageReadContainer: {
    justifyContent: "center",
    marginLeft: 8
  },
  serviceNameAndMessageTitleContainer: {
    flexDirection: "row"
  },
  serviceLogoAndSelectionContainer: {
    justifyContent: "center"
  },
  serviceLogoContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: IOVisualCostants.avatarSizeSmall,
    width: IOVisualCostants.avatarSizeSmall
  },
  textContainer: { flex: 1, marginLeft: 8 }
});

type ListItemMessageTag = {
  text: string;
  variant: Extract<Tag["variant"], "legalMessage" | "success">;
};

export type ListItemMessageProps = WithTestID<{
  tag?: ListItemMessageTag;
  avatarDouble?: boolean;
  formattedDate: string;
  isRead: boolean;
  messageTitle: string;
  organizationName: string;
  selected?: boolean;
  serviceLogos?: ImageSourcePropType;
  serviceName: string;
}> &
  Pick<
    ComponentProps<typeof Pressable>,
    "onPress" | "onLongPress" | "accessibilityLabel" | "accessibilityRole"
  >;

type UnreadBadgeProps = {
  color: ColorValue;
  width?: number;
};

const UnreadBadge = ({ color, width = 14 }: UnreadBadgeProps) => (
  <Svg width={width} height={width}>
    <Circle cx={"50%"} cy={"50%"} r={width / 2} fill={color} />
  </Svg>
);

export const ListItemMessage = ({
  accessibilityLabel,
  accessibilityRole,
  tag,
  avatarDouble,
  formattedDate,
  isRead,
  messageTitle,
  onLongPress,
  onPress,
  organizationName,
  serviceName,
  selected,
  serviceLogos,
  testID
}: ListItemMessageProps) => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  // Component colors
  const unreadBadgeColor = IOColors[theme["interactiveElem-default"]];
  const selectedBgColor =
    themeType === "dark"
      ? hexToRgba(IOColors["blueIO-300"], 0.1)
      : IOColors["blueIO-50"];

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessible={true}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityRole={accessibilityRole || "button"}
      accessibilityLabel={accessibilityLabel}
      style={{
        backgroundColor: selected ? selectedBgColor : undefined,
        minHeight: tag
          ? ListItemMessageEnhancedHeight
          : ListItemMessageStandardHeight
      }}
    >
      <Animated.View
        style={[
          IOListItemStyles.listItem,
          !selected ? backgroundAnimatedStyle : undefined,
          { flexGrow: 1, justifyContent: "center" }
        ]}
      >
        <Animated.View
          style={[IOListItemStyles.listItemInner, scaleAnimatedStyle]}
        >
          <View style={styles.container}>
            <View style={styles.serviceLogoAndSelectionContainer}>
              <View
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
                style={styles.serviceLogoContainer}
              >
                {avatarDouble ? (
                  <AvatarDouble backgroundLogoUri={serviceLogos} />
                ) : (
                  <Avatar logoUri={serviceLogos} size="small" />
                )}
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      pointerEvents: "none"
                    }
                  ]}
                >
                  <AnimatedMessageCheckbox
                    accessible={false}
                    checked={selected}
                  />
                </View>
              </View>
            </View>
            <View style={styles.textContainer}>
              <View style={styles.organizationContainer}>
                {/* We use 'flexGrow: 1, flexShrink: 1' instead of 'flex: 1'
                in order to keep a consistent styling approach between
                react and react-native (on react-native, 'flex: 1' does
                something similar to 'flex-grow') */}
                <H6
                  numberOfLines={1}
                  color={theme["textBody-default"]}
                  style={{ flexGrow: 1, flexShrink: 1 }}
                >
                  {organizationName}
                </H6>
                <BodySmall
                  color={theme["textBody-tertiary"]}
                  weight="Regular"
                  style={{ marginLeft: 8 }}
                >
                  {formattedDate}
                </BodySmall>
              </View>
              <View style={styles.serviceNameAndMessageTitleContainer}>
                <BodySmall numberOfLines={2} style={{ flex: 1 }}>
                  <BodySmall weight="Semibold">{`${serviceName} · `}</BodySmall>
                  <BodySmall weight="Regular">{messageTitle}</BodySmall>
                </BodySmall>
                {!isRead && (
                  <View style={styles.messageReadContainer}>
                    <UnreadBadge color={unreadBadgeColor} />
                  </View>
                )}
              </View>
              {tag && (
                /* We add a `View` because we need to re-arrange block elements using
               `VStack` and/or `HStack` */
                <View style={{ marginTop: 8 }}>
                  <HStack space={8}>
                    <Tag text={tag.text} variant={tag.variant} />
                    {tag.variant === "legalMessage" && (
                      <Tag
                        variant="attachment"
                        iconAccessibilityLabel={I18n.t(
                          "features.pn.details.attachmentsSection.title"
                        )}
                      />
                    )}
                  </HStack>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

import {
  AnimatedMessageCheckbox,
  Avatar,
  BodySmall,
  H6,
  HSpacer,
  IOColors,
  IOListItemStyles,
  IOStyles,
  IOVisualCostants,
  Tag,
  useIOTheme,
  WithTestID
} from "@pagopa/io-app-design-system";
import React, { ComponentProps } from "react";
import { ImageURISource, Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import I18n from "../../../../../i18n";
import { AvatarDouble } from "./AvatarDouble";
import { useListItemSpringAnimation } from "./useListItemSpringAnimation";

export const ListItemMessageStandardHeight = 95;
export const ListItemMessageEnhancedHeight = 133;

const styles = StyleSheet.create({
  badgeContainer: { flexDirection: "row", marginTop: 8 },
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
  textContainer: { ...IOStyles.flex, marginLeft: 8 }
});

export type ListItemMessage = WithTestID<{
  accessibilityLabel: string;
  badgeText?: string;
  badgeVariant?: "legalMessage" | "success";
  avatarDouble?: boolean;
  formattedDate: string;
  isRead: boolean;
  messageTitle: string;
  onLongPress: () => void;
  onPress: () => void;
  organizationName: string;
  selected?: boolean;
  serviceLogos?: ReadonlyArray<ImageURISource>;
  serviceName: string;
}> &
  Pick<
    ComponentProps<typeof Pressable>,
    | "onPress"
    | "onLongPress"
    | "accessibilityLabel"
    | "accessibilityHint"
    | "accessibilityState"
    | "accessibilityRole"
  >;

type BadgeComponentProps = {
  color?: IOColors;
  width?: number;
};

const BadgeComponent = ({ color, width = 14 }: BadgeComponentProps) => (
  <Svg width={width} height={width}>
    <Circle
      cx={"50%"}
      cy={"50%"}
      r={width / 2}
      fill={color ?? IOColors["blueIO-500"]}
    />
  </Svg>
);

export const ListItemMessage = ({
  accessibilityLabel,
  accessibilityRole,
  badgeText,
  badgeVariant,
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
}: ListItemMessage) => {
  const theme = useIOTheme();

  const { onPressIn, onPressOut, animatedScaleStyle, animatedBackgroundStyle } =
    useListItemSpringAnimation();

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
        backgroundColor: selected ? IOColors["blueIO-50"] : undefined,
        minHeight:
          badgeText && badgeVariant
            ? ListItemMessageEnhancedHeight
            : ListItemMessageStandardHeight
      }}
    >
      <Animated.View
        style={[
          IOListItemStyles.listItem,
          !selected ? animatedBackgroundStyle : undefined,
          { flexGrow: 1, justifyContent: "center" }
        ]}
      >
        <Animated.View
          style={[IOListItemStyles.listItemInner, animatedScaleStyle]}
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
                  <AnimatedMessageCheckbox checked={selected} />
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
                <BodySmall numberOfLines={2} style={IOStyles.flex}>
                  <BodySmall weight="Semibold">{`${serviceName} · `}</BodySmall>
                  <BodySmall weight="Regular">{messageTitle}</BodySmall>
                </BodySmall>
                {!isRead && (
                  <View style={styles.messageReadContainer}>
                    <BadgeComponent />
                  </View>
                )}
              </View>
              {badgeText && badgeVariant && (
                <View style={styles.badgeContainer}>
                  <Tag text={badgeText} variant={badgeVariant} />
                  {badgeVariant === "legalMessage" && (
                    <>
                      <HSpacer size={8} />
                      <Tag
                        variant="attachment"
                        iconAccessibilityLabel={I18n.t(
                          "features.pn.details.attachmentsSection.title"
                        )}
                      />
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

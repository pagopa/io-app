import React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  AnimatedMessageCheckbox,
  Avatar,
  Body,
  Caption,
  HSpacer,
  IOColors,
  IOStyles,
  IOVisualCostants,
  LabelSmall,
  LabelSmallAlt,
  Tag,
  WithTestID
} from "@pagopa/io-app-design-system";
import { CustomPressableListItemBase } from "./CustomPressableListItemBase";
import { DoubleAvatar } from "./DoubleAvatar";

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

type MessageListItemProps = WithTestID<{
  accessibilityLabel: string;
  badgeText?: string;
  doubleAvatar?: boolean;
  formattedDate: string;
  isRead: boolean;
  messageTitle: string;
  onLongPress: () => void;
  onPress: () => void;
  organizationName: string;
  selected?: boolean;
  serviceLogos?: ReadonlyArray<ImageURISource>;
  serviceName: string;
}>;

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

export const MessageListItem = ({
  accessibilityLabel,
  badgeText,
  doubleAvatar,
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
}: MessageListItemProps) => (
  <CustomPressableListItemBase
    onPress={onPress}
    onLongPress={onLongPress}
    selected={selected}
    testID={testID}
    accessibilityLabel={accessibilityLabel}
  >
    <View style={styles.container}>
      <View style={styles.serviceLogoAndSelectionContainer}>
        <View style={styles.serviceLogoContainer}>
          {doubleAvatar ? (
            <DoubleAvatar backgroundLogoUri={serviceLogos} />
          ) : (
            <Avatar logoUri={serviceLogos} size="small" />
          )}
          <View style={StyleSheet.absoluteFill}>
            <AnimatedMessageCheckbox checked={selected} />
          </View>
        </View>
      </View>
      <View style={styles.textContainer}>
        <View style={styles.organizationContainer}>
          <LabelSmallAlt numberOfLines={1} color="black" style={IOStyles.flex}>
            {organizationName}
          </LabelSmallAlt>
          <LabelSmall
            fontSize="regular"
            color="grey-700"
            weight="Regular"
            style={{ marginLeft: 8 }}
          >
            {formattedDate}
          </LabelSmall>
        </View>
        <View style={styles.serviceNameAndMessageTitleContainer}>
          <Body numberOfLines={2} style={IOStyles.flex}>
            <LabelSmall fontSize="regular" color="grey-700" weight="SemiBold">
              {serviceName}
            </LabelSmall>
            <Caption weight="Regular" color="grey-700">
              {" • "}
            </Caption>
            <LabelSmall fontSize="regular" weight="Regular" color="grey-700">
              {messageTitle}
            </LabelSmall>
          </Body>
          {!isRead && (
            <View style={styles.messageReadContainer}>
              <BadgeComponent />
            </View>
          )}
        </View>
        {badgeText && (
          <View style={styles.badgeContainer}>
            <Tag text={badgeText} variant="legalMessage" />
            <HSpacer size={8} />
            <Tag variant="attachment" />
          </View>
        )}
      </View>
    </View>
  </CustomPressableListItemBase>
);

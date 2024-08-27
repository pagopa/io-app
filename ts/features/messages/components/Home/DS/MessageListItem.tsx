import {
  AnimatedMessageCheckbox,
  Avatar,
  Body,
  H6,
  HSpacer,
  IOColors,
  IOStyles,
  IOVisualCostants,
  Label,
  LabelMini,
  LabelSmall,
  Tag,
  WithTestID
} from "@pagopa/io-app-design-system";
import React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import I18n from "../../../../../i18n";
import { CustomPressableListItemBase } from "./CustomPressableListItemBase";
import { DoubleAvatar } from "./DoubleAvatar";

export const StandardHeight = 95;
export const EnhancedHeight = 133;

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
  badgeVariant?: "legalMessage" | "success";
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
  badgeVariant,
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
    minHeight={badgeText && badgeVariant ? EnhancedHeight : StandardHeight}
  >
    <View style={styles.container}>
      <View style={styles.serviceLogoAndSelectionContainer}>
        <View
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
          style={styles.serviceLogoContainer}
        >
          {doubleAvatar ? (
            <DoubleAvatar backgroundLogoUri={serviceLogos} />
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
          <H6 numberOfLines={1} color="black" style={IOStyles.flex}>
            {organizationName}
          </H6>
          <LabelSmall
            color="grey-700"
            weight="Regular"
            style={{ marginLeft: 8 }}
          >
            {formattedDate}
          </LabelSmall>
        </View>
        <View style={styles.serviceNameAndMessageTitleContainer}>
          <Body numberOfLines={2} style={IOStyles.flex}>
            <Label weight="Semibold">{serviceName}</Label>
            <LabelMini color="grey-700">{" • "}</LabelMini>
            <Label weight="Regular">{messageTitle}</Label>
          </Body>
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
  </CustomPressableListItemBase>
);

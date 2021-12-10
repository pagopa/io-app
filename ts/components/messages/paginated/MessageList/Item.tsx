/**
 * A component to display the list item in the MessagesHomeScreen
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Badge } from "native-base";

import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import I18n from "../../../../i18n";
import {
  convertDateToWordDistance,
  convertReceivedDateToAccessible
} from "../../../../utils/convertDateToWordDistance";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import TouchableDefaultOpacity from "../../../TouchableDefaultOpacity";
import { H5 } from "../../../core/typography/H5";
import { H3 } from "../../../core/typography/H3";
import { BadgeComponent } from "../../../screens/BadgeComponent";
import IconFont from "../../../ui/IconFont";
import customVariables from "../../../../theme/variables";
import { IOColors } from "../../../core/variables/IOColors";

const ICON_WIDTH = 24;

const styles = StyleSheet.create({
  smallSpacer: {
    width: "100%",
    height: 4
  },
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  },
  spaced: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center"
  },
  badgeContainer: {
    flex: 0,
    paddingRight: 8,
    alignSelf: "flex-start",
    paddingTop: 6.5
  },
  viewStyle: {
    flexDirection: "row"
  },
  text12: {
    lineHeight: 18,
    marginBottom: -4,
    fontWeight: "bold"
  },
  icon: {
    width: 90,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    flexDirection: "row"
  },
  text3Line: {
    flex: 1,
    flexDirection: "row"
  },
  text3Container: {
    flex: 1,
    flexDirection: "row",
    minHeight: 24
  },
  text3SubContainer: { width: `95%` },
  badgeInfo: {
    borderWidth: 1,
    borderStyle: "solid",
    width: 65,
    height: 25,
    flexDirection: "row"
  },
  badgeInfoPaid: {
    borderColor: IOColors.aqua,
    backgroundColor: IOColors.aqua
  },
  archived: {
    opacity: 0.75
  },
  qrContainer: {
    marginRight: 16
  }
});

type Props = {
  category: MessageCategory;
  hasPaidBadge: boolean;
  isRead: boolean;
  isArchived: boolean;
  isSelected: boolean;
  isSelectionModeEnabled: boolean;
  message: UIMessage;
  onLongPress: () => void;
  onPress: () => void;
  service?: ServicePublic;
};

const UNKNOWN_SERVICE_DATA = {
  organizationName: I18n.t("messages.errorLoading.senderInfo"),
  serviceName: I18n.t("messages.errorLoading.serviceInfo")
};

const announceMessage = (message: UIMessage, isRead: boolean): string =>
  I18n.t("messages.accessibility.message.description", {
    newMessage: isRead
      ? I18n.t("messages.accessibility.message.read")
      : I18n.t("messages.accessibility.message.unread"),
    organizationName: message.organizationName,
    serviceName: message.serviceName,
    subject: message.title,
    receivedAt: convertReceivedDateToAccessible(message.createdAt)
  });

const MessageListItem = ({
  category,
  hasPaidBadge,
  isRead,
  isArchived,
  isSelected,
  isSelectionModeEnabled,
  message,
  onLongPress,
  onPress
}: Props) => {
  const uiDate = convertDateToWordDistance(
    message.createdAt,
    I18n.t("messages.yesterday")
  );
  const organizationName =
    message.organizationName || UNKNOWN_SERVICE_DATA.organizationName;
  const serviceName = message.serviceName || UNKNOWN_SERVICE_DATA.serviceName;
  const messageTitle = message.title || I18n.t("messages.errorLoading.noTitle");
  const iconName = isSelectionModeEnabled
    ? isSelected
      ? "io-checkbox-on"
      : "io-checkbox-off"
    : "io-right";
  const isEuCovidCert = category?.tag === "EU_COVID_CERT";

  return (
    <TouchableDefaultOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.verticalPad, isArchived && styles.archived]}
      accessible={true}
      accessibilityLabel={announceMessage(message, isRead)}
    >
      <View style={styles.spaced}>
        <H5>{organizationName}</H5>
        <Text style={styles.text12}>
          {isArchived ? `${I18n.t("messages.tab.archive")} ${uiDate}` : uiDate}
        </Text>
      </View>

      <View style={styles.viewStyle}>
        <Text>{serviceName}</Text>
      </View>
      <View style={styles.smallSpacer} />
      <View style={styles.text3Line}>
        <View style={styles.text3Container}>
          {!isRead && (
            <View style={styles.badgeContainer}>
              <BadgeComponent />
            </View>
          )}
          <View style={styles.text3SubContainer}>
            <H3 numberOfLines={2}>{messageTitle}</H3>
          </View>
        </View>

        <View style={styles.icon}>
          {hasPaidBadge && (
            <Badge style={[styles.badgeInfo, styles.badgeInfoPaid]}>
              <H5 color="bluegreyDark">{I18n.t("messages.badge.paid")}</H5>
            </Badge>
          )}

          {isEuCovidCert && (
            <View style={styles.qrContainer}>
              <IconFont name={"io-qr"} color={IOColors.blue} />
            </View>
          )}

          <IconFont
            name={iconName}
            size={ICON_WIDTH}
            color={customVariables.contentPrimaryBackground}
          />
        </View>
      </View>
    </TouchableDefaultOpacity>
  );
};

/**
 * assuming that:
 * - messages are immutable
 * - if the component is somehow reused the text content changes (avoid stale callbacks)
 */
const MessageListItemMemo = React.memo(
  MessageListItem,
  (prev: Props, curr: Props) =>
    curr.message.id === prev.message.id &&
    curr.isRead === prev.isRead &&
    curr.isArchived === prev.isArchived &&
    curr.isSelectionModeEnabled === prev.isSelectionModeEnabled &&
    curr.isSelected === prev.isSelected &&
    curr.hasPaidBadge === prev.hasPaidBadge
);

export default MessageListItemMemo;

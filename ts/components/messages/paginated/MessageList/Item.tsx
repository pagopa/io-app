import React from "react";
import { StyleSheet } from "react-native";
import { Badge, Text, View } from "native-base";
import * as O from "fp-ts/lib/Option";
import LegalMessage from "../../../../../img/features/mvl/legalMessage.svg";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryBase";
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
import QrCode from "../../../../../img/messages/qr-code.svg";

const ICON_WIDTH = 24;

const styles = StyleSheet.create({
  smallSpacer: {
    width: "100%",
    height: 4
  },
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  organizationNameWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "100%"
  },
  badgeContainer: {
    flex: 0,
    paddingRight: 8,
    alignSelf: "flex-start",
    paddingTop: 6.5,
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: "auto"
  },
  serviceName: {
    flexDirection: "row"
  },
  titleIconAndDate: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    flexDirection: "row"
  },
  dateTime: {
    lineHeight: 20,
    fontWeight: "bold",
    overflow: "hidden",
    textAlign: "right",
    marginLeft: 7
  },
  checkBoxContainer: {
    flexGrow: 0,
    flexShrink: 0
  },
  text3Line: {
    flex: 1,
    flexDirection: "row"
  },
  text3Container: {
    flex: 1,
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "100%",
    minHeight: 24
  },
  text3SubContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "100%"
  },
  badgeInfo: {
    borderWidth: 1,
    borderStyle: "solid",
    width: 74,
    height: 25,
    flexDirection: "row",
    backgroundColor: IOColors.aqua
  },
  badgeInfoPaid: {
    borderColor: IOColors.aqua,
    backgroundColor: IOColors.aqua
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: IOColors.blue,
    color: IOColors.white,
    height: 48,
    width: 48,
    borderRadius: 24
  },
  // needed to keep the inner item still between selections
  qrCheckBoxContainer: {
    minHeight: 48
  }
});

/**
 * The data structure representing a badge.
 */
type ItemBadge = "paid" | "qrcode";

/**
 * Given various item states, return the corresponding
 * visible badge.
 */
const getMaybeItemBadge = ({
  paid,
  qrCode
}: {
  paid: boolean;
  qrCode: boolean;
}): O.Option<ItemBadge> => {
  if (paid) {
    return O.some("paid");
  }

  if (qrCode) {
    return O.some("qrcode");
  }

  return O.none;
};

/**
 * Given an `ItemBadge` generates the corresponding
 * React node to display.
 */
const itemBadgeToTagOrIcon = (itemBadge: ItemBadge): React.ReactNode => {
  switch (itemBadge) {
    case "paid":
      return (
        <Badge style={[styles.badgeInfo, styles.badgeInfoPaid]}>
          <H5 color="bluegreyDark">{I18n.t("messages.badge.paid")}</H5>
        </Badge>
      );

    case "qrcode":
      return (
        <View style={styles.qrContainer}>
          <QrCode height={22} width={22} fill={IOColors.white} />
        </View>
      );
  }
};

/**
 * Given an `ItemBadge` generates the corresponding
 * accessibility state to assign.
 */
const itemBadgeToAccessibilityLabel = (itemBadge: ItemBadge): string => {
  switch (itemBadge) {
    case "paid":
      return I18n.t("messages.badge.paid");

    default:
      return "";
  }
};

function getTopIcon(category: MessageCategory) {
  switch (category.tag) {
    case TagEnum.LEGAL_MESSAGE:
      return (
        <LegalMessage width={20} height={20} fill={IOColors.bluegreyLight} />
      );
    default:
      return null;
  }
}

type Props = {
  category: MessageCategory;
  hasPaidBadge: boolean;
  isRead: boolean;
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

const announceMessage = (
  message: UIMessage,
  isRead: boolean,
  maybeItemBadge: O.Option<ItemBadge>
): string =>
  I18n.t("messages.accessibility.message.description", {
    newMessage: isRead
      ? I18n.t("messages.accessibility.message.read")
      : I18n.t("messages.accessibility.message.unread"),
    organizationName: message.organizationName,
    serviceName: message.serviceName,
    subject: message.title,
    receivedAt: convertReceivedDateToAccessible(message.createdAt),
    state: maybeItemBadge.map(itemBadgeToAccessibilityLabel).getOrElse("")
  });

/**
 * A component to display the list item in the MessagesHomeScreen
 */
const MessageListItem = ({
  category,
  hasPaidBadge,
  isRead,
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
  const iconName = isSelected ? "io-checkbox-on" : "io-checkbox-off";
  const showQrCode = category?.tag === "EU_COVID_CERT";

  const maybeItemBadge = getMaybeItemBadge({
    paid: hasPaidBadge,
    qrCode: showQrCode
  });

  return (
    <TouchableDefaultOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.verticalPad]}
      accessible={true}
      accessibilityLabel={announceMessage(message, isRead, maybeItemBadge)}
      accessibilityRole="button"
    >
      <View style={styles.titleRow}>
        <View style={styles.organizationNameWrapper}>
          <H5 numberOfLines={1}>{organizationName}</H5>
        </View>
        <View style={styles.titleIconAndDate}>
          {getTopIcon(category)}
          <Text numberOfLines={1} style={styles.dateTime}>
            {uiDate}
          </Text>
        </View>
      </View>

      <View style={styles.serviceName}>
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

        {isSelectionModeEnabled ? (
          <View
            style={[
              styles.checkBoxContainer,
              showQrCode && styles.qrCheckBoxContainer
            ]}
          >
            <IconFont
              name={iconName}
              size={ICON_WIDTH}
              color={customVariables.contentPrimaryBackground}
            />
          </View>
        ) : (
          maybeItemBadge.map(itemBadgeToTagOrIcon).getOrElse(undefined)
        )}
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
    curr.isSelectionModeEnabled === prev.isSelectionModeEnabled &&
    curr.isSelected === prev.isSelected &&
    curr.hasPaidBadge === prev.hasPaidBadge &&
    curr.onPress === prev.onPress
);

export default MessageListItemMemo;

/**
 * A component to display the list item in the MessageHomeScreen
 */
import { fromNullable } from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaidReason } from "../../store/reducers/entities/payments";
import { makeFontStyleObject } from "../../theme/fonts";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { messageNeedsCTABar } from "../../utils/messages";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { BadgeComponent } from "../screens/BadgeComponent";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import IconFont from "../ui/IconFont";
import MessageCTABar from "./MessageCTABar";

type Props = {
  isRead: boolean;
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
  isSelectionModeEnabled: boolean;
  isSelected: boolean;
};

const TITLE_LINE_HEIGHT = 21;

const styles = StyleSheet.create({
  mainWrapperSelected: {
    backgroundColor: "#E7F3FF"
  },
  serviceOrganizationName: {
    fontSize: 14,
    lineHeight: 18,
    color: customVariables.brandDarkestGray
  },
  serviceDepartmentName: {
    fontSize: 14,
    lineHeight: 18,
    color: customVariables.brandDarkGray
  },
  date: {
    ...makeFontStyleObject(Platform.select, "700"),
    fontSize: 14,
    lineHeight: 18,
    color: customVariables.brandDarkGray
  },
  titleUnread: {
    ...makeFontStyleObject(Platform.select, "700")
  },
  titleRead: {
    ...makeFontStyleObject(Platform.select, "400")
  },
  title: {
    fontSize: 18,
    lineHeight: TITLE_LINE_HEIGHT,
    color: customVariables.brandDarkestGray,
    flex: 1,
    height: TITLE_LINE_HEIGHT * 2,
    paddingRight: 24
  },
  container: {
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  smallSeparator: {
    width: "100%",
    height: 4
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  titleWithBadge: {
    flexDirection: "row",
    flex: 1,
    flexGrow: 1
  },
  badge: {
    alignSelf: "flex-start",
    paddingTop: 4,
    paddingRight: 8
  }
});

const UNKNOWN_SERVICE_DATA = {
  organizationName: I18n.t("messages.errorLoading.senderInfo"),
  serviceName: I18n.t("messages.errorLoading.serviceInfo")
};

class MessageListItem extends React.PureComponent<Props> {
  private handlePress = () => {
    this.props.onPress(this.props.message.id);
  };

  private handleLongPress = () => {
    this.props.onLongPress(this.props.message.id);
  };

  private getItemIcon = () => {
    const iconName = this.props.isSelected
      ? "io-checkbox-on"
      : "io-checkbox-off";

    const iconColor = this.props.isSelected
      ? variables.selectedColor
      : variables.unselectedColor;

    return this.props.isSelectionModeEnabled ? (
      <ButtonDefaultOpacity
        onPress={this.handleLongPress}
        transparent={true}
        style={{ flex: 1 }}
      >
        <IconFont name={iconName} color={iconColor} />
      </ButtonDefaultOpacity>
    ) : (
      <IconFont
        name={"io-right"}
        size={24}
        color={customVariables.contentPrimaryBackground}
      />
    );
  };

  public render() {
    const {
      isRead,
      message,
      service,
      payment,
      isSelectionModeEnabled,
      isSelected
    } = this.props;

    const uiService = fromNullable(service).fold(UNKNOWN_SERVICE_DATA, _ => ({
      organizationName: _.organization_name,
      serviceName: _.service_name
    }));

    const uiDate = convertDateToWordDistance(
      message.created_at,
      I18n.t("messages.yesterday")
    );

    return (
      <TouchableDefaultOpacity
        style={[
          styles.container,
          isSelected ? styles.mainWrapperSelected : undefined
        ]}
        onPress={this.handlePress}
        onLongPress={this.handleLongPress}
      >
        <View style={styles.header}>
          <View>
            <Text numberOfLines={1} style={styles.serviceOrganizationName}>
              {uiService.organizationName}
            </Text>
            <Text numberOfLines={1} style={styles.serviceDepartmentName}>
              {uiService.serviceName}
            </Text>
          </View>
          <Text style={styles.date}>{uiDate}</Text>
        </View>
        <View style={styles.smallSeparator} />
        <View style={styles.content}>
          <View style={styles.titleWithBadge}>
            {!isRead && (
              <View style={styles.badge}>
                <BadgeComponent />
              </View>
            )}
            <Text
              numberOfLines={2}
              style={[
                styles.title,
                isRead ? styles.titleRead : styles.titleUnread
              ]}
            >
              {message.content.subject}
            </Text>
          </View>
          {this.getItemIcon()}
        </View>
        {messageNeedsCTABar(message) && (
          <React.Fragment>
            <View spacer={true} large={true} />
            <MessageCTABar
              message={message}
              service={service}
              payment={payment}
              small={true}
              disabled={isSelectionModeEnabled}
            />
          </React.Fragment>
        )}
      </TouchableDefaultOpacity>
    );
  }
}

export default MessageListItem;

import { fromNullable } from "fp-ts/lib/Option";
import { Button, Text, View } from "native-base";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaidReason } from "../../store/reducers/entities/payments";
import { makeFontStyleObject } from "../../theme/fonts";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { messageNeedsCTABar } from "../../utils/messages";
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

const styles = StyleSheet.create({
  highlight: {
    flex: 1
  },

  mainWrapper: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding
  },

  mainWrapperSelected: {
    backgroundColor: "#E7F3FF"
  },

  headerWrapper: {
    flexDirection: "row",
    marginBottom: 4
  },

  headerLeft: {
    flex: 0,
    paddingRight: 4
  },

  headerCenter: {
    flex: 1,
    paddingRight: 32
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

  headerRight: {
    flex: 0
  },

  messageDate: {
    ...makeFontStyleObject(Platform.select, "700", false),
    fontSize: 14,
    lineHeight: 18,
    color: customVariables.brandDarkGray
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 42
  },

  contentCenter: {
    flex: 1,
    paddingRight: 32
  },

  messageTitle: {
    ...makeFontStyleObject(Platform.select, "700", false),
    fontSize: 16,
    lineHeight: 21,
    color: customVariables.brandDarkestGray
  },

  contentRight: {
    flex: 0
  },

  selectionCheckbox: {
    left: 0,
    paddingBottom: 1
  },

  footerWrapper: {
    height: 32,
    marginTop: 12
  }
});

const UNKNOWN_SERVICE_DATA = {
  organizationName: "Mittente sconosciuto",
  departmentName: "Info sul servizio mancanti"
};

const MessageUnreadIcon = (
  <Svg width={14} height={18}>
    <Circle
      cx="50%"
      cy="50%"
      r={14 / 2}
      fill={customVariables.contentPrimaryBackground}
    />
  </Svg>
);

class MessageListItem extends React.PureComponent<Props> {
  private handlePress = () => {
    this.props.onPress(this.props.message.id);
  };

  private handleLongPress = () => {
    this.props.onLongPress(this.props.message.id);
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
      departmentName: _.department_name
    }));

    const uiDate = convertDateToWordDistance(
      message.created_at,
      I18n.t("messages.yesterday")
    );

    const iconName = isSelected ? "io-checkbox-on" : "io-checkbox-off";

    const iconColor = isSelected
      ? variables.selectedColor
      : variables.unselectedColor;

    return (
      <TouchableOpacity
        style={styles.highlight}
        onPress={this.handlePress}
        onLongPress={this.handleLongPress}
      >
        <View
          style={[
            styles.mainWrapper,
            isSelected ? styles.mainWrapperSelected : undefined
          ]}
        >
          <View style={styles.headerWrapper}>
            {!isRead && (
              <View style={styles.headerLeft}>{MessageUnreadIcon}</View>
            )}
            <View style={styles.headerCenter}>
              <Text numberOfLines={1} style={styles.serviceOrganizationName}>
                {uiService.organizationName}
              </Text>
              <Text numberOfLines={1} style={styles.serviceDepartmentName}>
                {uiService.departmentName}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.messageDate}>{uiDate}</Text>
            </View>
          </View>

          <View style={styles.contentWrapper}>
            <View style={styles.contentCenter}>
              <Text numberOfLines={2} style={styles.messageTitle}>
                {message.content.subject}
              </Text>
            </View>
            <View style={styles.contentRight}>
              {isSelectionModeEnabled ? (
                <Button onPress={this.handleLongPress} transparent={true}>
                  <IconFont name={iconName} color={iconColor} />
                </Button>
              ) : (
                <IconFont
                  name="io-right"
                  size={24}
                  color={customVariables.contentPrimaryBackground}
                />
              )}
            </View>
          </View>

          {messageNeedsCTABar(message) && (
            <View style={styles.footerWrapper}>
              <MessageCTABar
                message={message}
                service={service}
                payment={payment}
                small={true}
                disabled={isSelectionModeEnabled}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}

export default MessageListItem;

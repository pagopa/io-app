import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { CheckBox, Text, View } from "native-base";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { PaidReason } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import IconFont from "../ui/IconFont";
import MessageCTABar from "./MessageCTABar";

export const styles = StyleSheet.create({
  itemContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding,
    paddingTop: 16
  },

  itemGrid: {
    borderBottomColor: variables.brandLightGray,
    borderBottomWidth: 1,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0
  },

  serviceRow: {
    marginBottom: 10
  },

  serviceText: {
    fontSize: variables.fontSize3,
    lineHeight: 20,
    paddingRight: 5
  },

  readCol: {
    marginLeft: -5
  },

  selectionCheckbox: {
    left: 0
  },

  readIcon: {
    lineHeight: 20
  },

  serviceTextNew: {
    color: variables.h2Color
  },

  dateText: {
    color: variables.brandDarkGray,
    fontSize: variables.fontSize2,
    lineHeight: 16
  },

  subjectRow: {
    marginBottom: 16
  },

  iconContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row"
  },

  ctaBarContainer: {
    marginBottom: 16
  }
});

type Props = {
  messageState: MessageState;
  potService: pot.Pot<ServicePublic, Error>;
  maybePaidReason: Option<PaidReason>;
  isSelectionModeEnabled: boolean;
  isSelected: boolean;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
};

class InboxItem extends React.PureComponent<Props> {
  public render() {
    const {
      messageState,
      potService,
      maybePaidReason,
      isSelectionModeEnabled,
      isSelected
    } = this.props;

    // Extract the message
    const { meta, message, isRead } = messageState;

    const uiCreatedAt = convertDateToWordDistance(
      meta.created_at,
      I18n.t("messages.yesterday")
    );

    const uiSubject = pot.isLoading(message)
      ? ""
      : pot.getOrElse(
          pot.map(message, _ => _.content.subject),
          I18n.t("messages.noContent")
        );

    const uiService = pot.isLoading(potService)
      ? ""
      : pot.getOrElse(
          pot.map(
            potService,
            s => `${s.organization_name} - ${s.department_name}`
          ),
          I18n.t("messages.unknownSender")
        );

    return (
      <TouchableOpacity
        onPress={this.handlePress}
        onLongPress={this.handleLongPress}
      >
        <View style={[styles.itemContainer]}>
          <Grid style={styles.itemGrid}>
            <Row style={styles.serviceRow}>
              {isSelectionModeEnabled && (
                <Col>
                  <CheckBox
                    onPress={this.handleLongPress}
                    checked={isSelected}
                    style={styles.selectionCheckbox}
                  />
                </Col>
              )}
              {!isSelectionModeEnabled &&
                !isRead && (
                  <Col style={styles.readCol}>
                    <IconFont
                      name="io-new"
                      color={variables.contentPrimaryBackground}
                      size={24}
                      style={styles.readIcon}
                    />
                  </Col>
                )}
              <Col size={10}>
                <Text
                  style={[
                    styles.serviceText,
                    !isRead ? styles.serviceTextNew : undefined
                  ]}
                  leftAlign={true}
                  bold={true}
                >
                  {uiService}
                </Text>
              </Col>
              <Col size={2}>
                <Text style={styles.dateText} rightAlign={true}>
                  {uiCreatedAt}
                </Text>
              </Col>
            </Row>
            <Row style={styles.subjectRow}>
              <Col size={11}>
                <Text leftAlign={true}>{uiSubject}</Text>
              </Col>
              <Col size={1} style={styles.iconContainer}>
                <IconFont
                  name="io-right"
                  size={24}
                  color={variables.contentPrimaryBackground}
                />
              </Col>
            </Row>
            <Row>
              {pot.isSome(message) && (
                <MessageCTABar
                  message={message.value}
                  potService={potService}
                  maybePaidReason={maybePaidReason}
                  containerStyle={styles.ctaBarContainer}
                />
              )}
            </Row>
          </Grid>
        </View>
      </TouchableOpacity>
    );
  }

  private handlePress = () => {
    if (this.props.isSelectionModeEnabled) {
      // If the selection mode is enabled onPress must have the same onLongPress effect
      this.props.onLongPress(this.props.messageState.meta.id);
    } else {
      this.props.onPress(this.props.messageState.meta.id);
    }
  };

  private handleLongPress = () => {
    this.props.onLongPress(this.props.messageState.meta.id);
  };
}

export default InboxItem;

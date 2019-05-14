import * as pot from "italia-ts-commons/lib/pot";
import { CheckBox, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import Placeholder from "rn-placeholder";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import IconFont from "../ui/IconFont";
import MessageCTABar from "./MessageCTABar";

type OwnProps = {
  messageState: MessageState;
  paymentByRptId: GlobalState["entities"]["paymentByRptId"];
  service: pot.Pot<ServicePublic, Error>;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
  isSelectionModeEnabled: boolean;
  isSelected: boolean;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  itemContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding,
    paddingTop: 16
  },

  grid: {
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
    fontSize: variables.fontSize1,
    lineHeight: 20,
    paddingRight: 5
  },

  readCol: {
    marginLeft: -4,
    width: variables.contentPadding
  },

  readIcon: {
    lineHeight: 20
  },

  serviceTextNew: {
    color: variables.h2Color
  },

  dateText: {
    color: variables.brandDarkGray,
    fontSize: variables.fontSizeSmall,
    lineHeight: 16
  },

  subjectRow: {
    alignItems: "center",
    marginBottom: 16
  },

  iconContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row"
  },

  ctaBarContainer: {
    marginBottom: 16
  },

  selectionCheckbox: {
    left: 0,
    paddingBottom: 1
  },

  itemSelected: {
    backgroundColor: "#E7F3FF"
  }
});

export class MessageListItemComponent extends React.Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    if (
      this.props.messageState.message.kind !==
      nextProps.messageState.message.kind
    ) {
      return true;
    }
    if (pot.isNone(this.props.messageState.message)) {
      return false;
    }
    const message = this.props.messageState.message.value;
    const { payment_data } = message.content;
    const rptId =
      payment_data !== undefined
        ? pot.getOrElse(
            pot.map(
              this.props.service,
              service =>
                `${service.organization_fiscal_code}${
                  payment_data.notice_number
                }`
            ),
            undefined
          )
        : undefined;
    return (
      this.props.service.kind !== nextProps.service.kind ||
      this.props.messageState.isRead !== nextProps.messageState.isRead ||
      (rptId !== undefined &&
        this.props.paymentByRptId[rptId] !== nextProps.paymentByRptId[rptId]) ||
      this.props.isSelectionModeEnabled !== nextProps.isSelectionModeEnabled ||
      this.props.isSelected !== nextProps.isSelected
    );
  }

  public render() {
    const {
      messageState,
      paymentByRptId,
      service,
      isSelectionModeEnabled,
      isSelected
    } = this.props;

    const { message, meta } = messageState;

    // TODO: Extract this to external file
    const uiService = pot.isLoading(service)
      ? ""
      : pot.getOrElse(
          pot.map(
            service,
            s => `${s.organization_name} - ${s.department_name}`
          ),
          I18n.t("messages.unknownSender")
        );

    const serviceComponent = (
      <Placeholder.Line
        textSize={variables.fontSizeBase}
        color={variables.shineColor}
        width="100%"
        animate="shine"
        onReady={!pot.isLoading(service)}
      >
        <Text
          style={[
            styles.serviceText,
            !messageState.isRead ? styles.serviceTextNew : undefined
          ]}
          leftAlign={true}
          bold={true}
        >
          {uiService}
        </Text>
      </Placeholder.Line>
    );

    // Try to convert createdAt to a human representation, fall back to original
    // value if createdAt cannot be converted to a Date
    // TODO: get created_at from CreatedMessageWithoutContent to avoid waiting
    //       for the message to load
    /*
    const uiCreatedAt = pot.getOrElse(
      pot.map(message, m =>
        DateFromISOString.decode(m.created_at)
          .map(_ => convertDateToWordDistance(_, I18n.t("messages.yesterday")))
          .getOrElse(m.created_at)
      ),
      ""
    );
    */

    const subject = pot.isLoading(message)
      ? ""
      : pot.getOrElse(
          pot.map(message, _ => _.content.subject),
          I18n.t("messages.noContent")
        );

    const subjectComponent = (
      <Placeholder.Paragraph
        lineNumber={2}
        textSize={variables.fontSizeBase}
        lineSpacing={5}
        color={variables.shineColor}
        width="100%"
        firstLineWidth="100%"
        lastLineWidth="75%"
        animate="shine"
        onReady={!pot.isLoading(message)}
      >
        <Text leftAlign={true}>{subject}</Text>
      </Placeholder.Paragraph>
    );

    return (
      <TouchableOpacity
        key={meta.id}
        onPress={this.handlePress}
        onLongPress={this.handleLongPress}
      >
        <View
          style={[
            styles.itemContainer,
            isSelected ? styles.itemSelected : undefined
          ]}
        >
          <Grid style={styles.grid}>
            <Row style={styles.serviceRow}>
              {!messageState.isRead && (
                <Col style={styles.readCol}>
                  <IconFont
                    name="io-new"
                    color={variables.contentPrimaryBackground}
                    size={24}
                    style={styles.readIcon}
                  />
                </Col>
              )}
              <Col size={10}>{serviceComponent}</Col>
              <Col size={3}>
                <Text style={styles.dateText} rightAlign={true}>
                  {""}
                </Text>
              </Col>
            </Row>
            <Row style={styles.subjectRow}>
              <Col size={11}>{subjectComponent}</Col>
              <Col size={1} style={styles.iconContainer}>
                {isSelectionModeEnabled ? (
                  <CheckBox
                    onPress={this.handleLongPress}
                    checked={isSelected}
                    style={styles.selectionCheckbox}
                  />
                ) : (
                  <IconFont
                    name="io-right"
                    size={24}
                    color={variables.contentPrimaryBackground}
                  />
                )}
              </Col>
            </Row>
            <Row>
              {pot.isSome(message) && (
                <MessageCTABar
                  message={message.value}
                  paymentByRptId={paymentByRptId}
                  service={service}
                  containerStyle={styles.ctaBarContainer}
                  disabled={isSelectionModeEnabled}
                  small={true}
                />
              )}
            </Row>
          </Grid>
        </View>
      </TouchableOpacity>
    );
  }

  private handlePress = () => {
    this.props.onPress(this.props.messageState.meta.id);
  };

  private handleLongPress = () => {
    this.props.onLongPress(this.props.messageState.meta.id);
  };
}

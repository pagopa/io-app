import { DateFromISOString } from "io-ts-types";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";

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
  onItemPress?: (messageId: string) => void;
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
    fontSize: variables.fontSize3,
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
        this.props.paymentByRptId[rptId] !== nextProps.paymentByRptId[rptId])
    );
  }

  public render() {
    const { messageState, onItemPress, paymentByRptId, service } = this.props;

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

    // Try to convert createdAt to a human representation, fall back to original
    // value if createdAt cannot be converted to a Date
    // TODO: get created_at from CreatedMessageWithoutContent to avoid waiting
    //       for the message to load
    const uiCreatedAt = pot.getOrElse(
      pot.map(message, m =>
        DateFromISOString.decode(m.created_at)
          .map(_ => convertDateToWordDistance(_, I18n.t("messages.yesterday")))
          .getOrElse(m.created_at)
      ),
      ""
    );

    const subject = pot.isLoading(message)
      ? ""
      : pot.getOrElse(
          pot.map(message, _ => _.content.subject),
          I18n.t("messages.noContent")
        );

    const onItemPressHandler = onItemPress
      ? () => onItemPress(meta.id)
      : undefined;

    return (
      <TouchableOpacity key={meta.id} onPress={onItemPressHandler}>
        <View style={styles.itemContainer}>
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
              <Col size={10}>
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
              </Col>
              <Col size={2}>
                <Text style={styles.dateText} rightAlign={true}>
                  {uiCreatedAt}
                </Text>
              </Col>
            </Row>
            <Row style={styles.subjectRow}>
              <Col size={11}>
                <Text leftAlign={true}>{subject}</Text>
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
                  paymentByRptId={paymentByRptId}
                  service={service}
                  containerStyle={styles.ctaBarContainer}
                />
              )}
            </Row>
          </Grid>
        </View>
      </TouchableOpacity>
    );
  }
}

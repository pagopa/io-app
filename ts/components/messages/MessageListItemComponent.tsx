import { DateFromISOString } from "io-ts-types";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { MessageUIStates } from "../../store/reducers/entities/messages/messagesUIStatesById";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import IconFont from "../ui/IconFont";
import MessageCTABar from "./MessageCTABar";

type OwnProps = {
  messageId: string;
  message: pot.Pot<MessageWithContentPO, string>;
  messageUIStates: MessageUIStates;
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
    if (this.props.message.kind !== nextProps.message.kind) {
      return true;
    }
    if (pot.isNone(this.props.message)) {
      return false;
    }
    const message = this.props.message.value;
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
      this.props.messageUIStates.read !== nextProps.messageUIStates.read ||
      (rptId !== undefined &&
        this.props.paymentByRptId[rptId] !== nextProps.paymentByRptId[rptId])
    );
  }

  public render() {
    const {
      messageId,
      message,
      paymentByRptId,
      messageUIStates,
      service,
      onItemPress
    } = this.props;

    // TODO: Extract this to external file
    const uiService = pot.getOrElse(
      pot.map(service, s => `${s.organization_name} - ${s.department_name}`),
      I18n.t("messages.unknownSender")
    );

    // Try to convert createdAt to a human representation, fall back to original
    // value if createdAt cannot be converted to a Date
    // TODO: Extract this to external file
    const uiCreatedAt = pot.map(message, m =>
      DateFromISOString.decode(m.created_at)
        .map(_ => convertDateToWordDistance(_, I18n.t("messages.yesterday")))
        .getOrElse(m.created_at)
    );

    const onItemPressHandler =
      onItemPress && pot.isSome(message)
        ? () => onItemPress(message.value.id)
        : undefined;

    const subject = pot.getOrElse(
      pot.map(message, _ => _.content.subject),
      null
    );

    return (
      <TouchableOpacity key={messageId} onPress={onItemPressHandler}>
        <View style={styles.itemContainer}>
          <Grid style={styles.grid}>
            <Row style={styles.serviceRow}>
              {!messageUIStates.read && (
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
                    !messageUIStates.read ? styles.serviceTextNew : undefined
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

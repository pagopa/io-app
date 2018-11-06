import { DateFromISOString } from "io-ts-types";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { MessageUIStates } from "../../store/reducers/entities/messages/messagesUIStatesById";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import * as pot from "../../types/pot";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import IconFont from "../ui/IconFont";
import MessageCTABar from "./MessageCTABar";

type OwnProps = {
  message: MessageWithContentPO;
  messageUIStates: MessageUIStates;
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

export class MessageListItemComponent extends React.PureComponent<Props> {
  public render() {
    const { message, messageUIStates, service, onItemPress } = this.props;

    // TODO: Extract this to external file
    const uiService = pot.getOrElse(
      pot.map(service, s => `${s.organization_name} - ${s.department_name}`),
      I18n.t("messages.unknownSender")
    );

    // Try to convert createdAt to a human representation, fall back to original
    // value if createdAt cannot be converted to a Date
    // TODO: Extract this to external file
    const uiCreatedAt = DateFromISOString.decode(message.created_at)
      .map(_ => convertDateToWordDistance(_, I18n.t("messages.yesterday")))
      .getOrElse(message.created_at);

    const onItemPressHandler = onItemPress
      ? () => onItemPress(message.id)
      : undefined;

    return (
      <TouchableOpacity key={message.id} onPress={onItemPressHandler}>
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
                <Text leftAlign={true}>{message.content.subject}</Text>
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
              <MessageCTABar
                message={message}
                service={service}
                containerStyle={styles.ctaBarContainer}
              />
            </Row>
          </Grid>
        </View>
      </TouchableOpacity>
    );
  }
}

import * as pot from "italia-ts-commons/lib/pot";
import { Badge, View } from "native-base";
import React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { connect } from "react-redux";
import { lexicallyOrderedMessagesStateSelector } from "../store/reducers/entities/messages";
import { MessageState } from "../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../store/reducers/types";
import variables from "../theme/variables";
import IconFont from "./ui/IconFont";

type OwnProps = {
  color?: string;
};

const styles = StyleSheet.create({
  textBadgeStyle: {
    fontSize: 10,
    fontFamily: "Titillium Web",
    fontWeight: "bold",
    color: "white",
    flex: 1,
    position: "absolute",
    height: 19,
    width: 19,
    textAlign: "center",
    paddingRight: 3
  },
  badgeStyle: {
    backgroundColor: variables.brandPrimary,
    borderColor: "white",
    borderWidth: 2,
    position: "absolute",
    elevation: 0.1,
    shadowColor: "white",
    height: 19,
    width: 19,
    left: 12,
    bottom: 10
  }
});

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * Filters the list of messages and returns the number of unread messages.
 */
const getNumberMessagesUnread = (
  potMessagesState: pot.Pot<ReadonlyArray<MessageState>, string>
): number =>
  pot.getOrElse(
    pot.map(potMessagesState, _ =>
      _.filter(messageState => !messageState.isRead)
    ),
    []
  ).length;

/**
 * Message icon add badge.
 */
class MessagesTabIcon extends React.PureComponent<Props> {
  public render() {
    const { color, messagesUnread } = this.props;
    return (
      <View>
        <IconFont
          name={"io-messaggi"}
          size={variables.iconSize3}
          color={color}
        />
        {messagesUnread > 0 ? (
          Platform.OS === "ios" ? (
            <Badge style={styles.badgeStyle}>
              <Text style={[styles.textBadgeStyle, { top: 0 }]}>
                {messagesUnread}
              </Text>
            </Badge>
          ) : (
            <Badge style={styles.badgeStyle}>
              <Text style={styles.textBadgeStyle}>{messagesUnread}</Text>
            </Badge>
          )
        ) : null}
      </View>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  messagesUnread:
    getNumberMessagesUnread(lexicallyOrderedMessagesStateSelector(state)) < 99
      ? getNumberMessagesUnread(lexicallyOrderedMessagesStateSelector(state))
      : 99
});

export default connect(mapStateToProps)(MessagesTabIcon);

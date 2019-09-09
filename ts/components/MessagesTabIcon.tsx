import React from "react";

import PushNotification from "react-native-push-notification";
import { connect } from "react-redux";

import { messagesUnreadAndUnarchivedSelector } from "../store/reducers/entities/messages";
import { GlobalState } from "../store/reducers/types";
import TabIconComponent from "./ui/TabIconComponent";

type OwnProps = {
  color?: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const MAX_BADGE_VALUE = 99;

/**
 * Message tab icon with badge indicator
 */
class MessagesTabIcon extends React.PureComponent<Props> {
  public render() {
    const { color, badgeValue } = this.props;
    return (
      <TabIconComponent
        iconName={"io-messaggi"}
        badgeValue={badgeValue}
        color={color}
      />
    );
  }
}

function mapStateToProps(state: GlobalState) {
  const messagesUnreadAndUnarchived = messagesUnreadAndUnarchivedSelector(
    state
  );

  const badgeValue = Math.min(messagesUnreadAndUnarchived, MAX_BADGE_VALUE);

  PushNotification.setApplicationIconBadgeNumber(badgeValue);

  return { badgeValue };
}

export default connect(mapStateToProps)(MessagesTabIcon);

import React from "react";
import { connect } from "react-redux";

import { messagesUnreadedAndUnarchivedSelector } from "../store/reducers/entities/messages";
import { GlobalState } from "../store/reducers/types";
import TabIconComponent from "./ui/TabIconComponent";

type OwnProps = {
  color?: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * Message tab icon with badge indicator
 */
class MessagesTabIcon extends React.PureComponent<Props> {
  public render() {
    const { color, messagesUnreaded } = this.props;
    return (
      <TabIconComponent
        iconName={"io-messaggi"}
        badgeValue={messagesUnreaded}
        color={color}
      />
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    messagesUnreaded: messagesUnreadedAndUnarchivedSelector(state)
  };
}

export default connect(mapStateToProps)(MessagesTabIcon);

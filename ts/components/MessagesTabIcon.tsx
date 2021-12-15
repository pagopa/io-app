import React from "react";
import { connect } from "react-redux";

import { messagesUnreadAndUnarchivedSelector } from "../store/reducers/entities/messages";
import { GlobalState } from "../store/reducers/types";
import { usePaginatedMessages } from "../config";
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
    const { color, messagesUnread } = this.props;
    return (
      <TabIconComponent
        iconName={"io-messaggi"}
        // badge is disabled with paginated messages see https://pagopa.atlassian.net/browse/IA-572
        badgeValue={usePaginatedMessages ? undefined : messagesUnread}
        color={color}
      />
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    messagesUnread: messagesUnreadAndUnarchivedSelector(state)
  };
}

export default connect(mapStateToProps)(MessagesTabIcon);

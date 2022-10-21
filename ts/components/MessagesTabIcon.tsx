import React from "react";

import TabIconComponent from "./ui/TabIconComponent";

type OwnProps = {
  color?: string;
};

type Props = OwnProps;

/**
 * Message tab icon with badge indicator
 */
class MessagesTabIcon extends React.PureComponent<Props> {
  public render() {
    const { color } = this.props;
    return (
      <TabIconComponent
        iconName={"io-messaggi"}
        // badge is disabled with paginated messages see https://pagopa.atlassian.net/browse/IA-572
        badgeValue={undefined}
        color={color}
      />
    );
  }
}

export default MessagesTabIcon;

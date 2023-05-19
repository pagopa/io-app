import React from "react";

import { ColorValue } from "react-native";
import TabIconComponent from "./ui/TabIconComponent";

type OwnProps = {
  color?: ColorValue;
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
        iconName={"navMessages"}
        // badge is disabled with paginated messages see https://pagopa.atlassian.net/browse/IA-572
        badgeValue={undefined}
        color={color}
      />
    );
  }
}

export default MessagesTabIcon;

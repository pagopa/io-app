/**
 * Service tab icon with badge indicator
 * TODO: make badge displays the sum of unread service into the "Local" and the "National" tabs
 *        https://www.pivotaltracker.com/story/show/168169955
 */
import React from "react";
import { connect } from "react-redux";

import { servicesBadgeValueSelector } from "../store/reducers/entities/services";
import { GlobalState } from "../store/reducers/types";
import TabIconComponent from "./ui/TabIconComponent";

type OwnProps = {
  color?: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

class ServiceTabIcon extends React.PureComponent<Props> {
  public render() {
    const { color, unreadServices } = this.props;
    return (
      <TabIconComponent
        iconName={"io-servizi"}
        badgeValue={unreadServices}
        color={color}
      />
    );
  }
}

function mapStateToProps(state: GlobalState) {
  return {
    unreadServices: servicesBadgeValueSelector(state)
  };
}

export default connect(mapStateToProps)(ServiceTabIcon);

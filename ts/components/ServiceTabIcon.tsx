import React from "react";
import { connect } from "react-redux";

import { unreadServicesByIdSelector } from "../store/reducers/entities/services/readStateByServiceId";
import { GlobalState } from "../store/reducers/types";
import TabIconComponent from "./ui/TabIconComponent";

type OwnProps = {
  color?: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * Wallet tab icon with badge indicator
 */
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
  const unreadServicesById = unreadServicesByIdSelector(state);
  return {
    unreadServices: unreadServicesById.length
  };
}

export default connect(mapStateToProps)(ServiceTabIcon);

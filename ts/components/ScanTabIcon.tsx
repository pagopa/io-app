import React from "react";
import { connect } from "react-redux";
import { ColorValue } from "react-native";
import { getSafeUnreadTransactionsNumSelector } from "../store/reducers/entities/readTransactions";
import { GlobalState } from "../store/reducers/types";
import TabIconComponent from "./ui/TabIconComponent";

type OwnProps = {
  color?: ColorValue;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * Wallet tab icon with badge indicator
 */
class ScanTabIcon extends React.PureComponent<Props> {
  public render() {
    const { color, unreadTransactions } = this.props;
    return (
      <TabIconComponent
        iconName={"navScan"}
        badgeValue={unreadTransactions}
        color={color}
      />
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  unreadTransactions: getSafeUnreadTransactionsNumSelector(state)
});

export default connect(mapStateToProps)(ScanTabIcon);

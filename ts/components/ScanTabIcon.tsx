import React from "react";
import { ColorValue } from "react-native";
import TabIconComponent from "./ui/TabIconComponent";

type Props = {
  color?: ColorValue;
};

/**
 * Wallet tab icon with badge indicator
 */
class ScanTabIcon extends React.PureComponent<Props> {
  public render() {
    return <TabIconComponent iconName={"navScan"} color={this.props.color} />;
  }
}

export default ScanTabIcon;

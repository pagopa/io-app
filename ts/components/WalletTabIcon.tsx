import React from "react";
import { ColorValue } from "react-native";
import TabIconComponent from "./ui/TabIconComponent";

type Props = {
  color?: ColorValue;
};

/**
 * Wallet tab icon with badge indicator
 */
class WalletTabIcon extends React.PureComponent<Props> {
  public render() {
    return <TabIconComponent iconName={"navWallet"} color={this.props.color} />;
  }
}

export default WalletTabIcon;

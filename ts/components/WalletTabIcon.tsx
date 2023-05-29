import React from "react";
import { ColorValue } from "react-native";
import { TabIconComponent } from "./ui/TabIconComponent";

type WalletTabIcon = {
  focused: boolean;
  color?: ColorValue;
};

/**
 * Wallet tab icon with badge indicator
 */
const WalletTabIcon = ({ focused, color }: WalletTabIcon) => (
  <TabIconComponent
    iconName={"navWallet"}
    iconNameFocused={"navWalletSelected"}
    color={color}
    focused={focused}
  />
);

export default WalletTabIcon;

import React from "react";

import { ColorValue } from "react-native";
import { TabIconComponent } from "./ui/TabIconComponent";

type WalletTabIcon = {
  color?: ColorValue;
  focused: boolean;
};

/**
 * Message Tab Icon
 */
const MessagesTabIcon = ({ focused, color }: WalletTabIcon) => (
  <TabIconComponent
    iconName={"navMessages"}
    iconNameFocused={"navMessagesSelected"}
    color={color}
    focused={focused}
    // Badge is disabled with paginated messages.
    // https://pagopa.atlassian.net/browse/IA-572
  />
);

export default MessagesTabIcon;

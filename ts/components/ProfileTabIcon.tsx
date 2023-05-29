import React from "react";

import { ColorValue } from "react-native";
import { TabIconComponent } from "./ui/TabIconComponent";

type ProfileTabIcon = {
  focused: boolean;
  color?: ColorValue;
};
/**
 * Profile Tab Icon
 */
const ProfileTabIcon = ({ focused, color }: ProfileTabIcon) => (
  <TabIconComponent
    iconName={"navProfile"}
    iconNameFocused={"navProfileSelected"}
    color={color}
    focused={focused}
    // Badge is disabled with paginated messages.
    // https://pagopa.atlassian.net/browse/IA-572
  />
);

export default ProfileTabIcon;

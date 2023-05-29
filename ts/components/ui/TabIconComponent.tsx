import { ColorValue, View } from "react-native";
import React from "react";
import { AnimatedIcon, IONavIcons } from "../core/icons";
import CustomBadge from "./CustomBadge";

type TabIconComponent = {
  focused: boolean;
  iconName: IONavIcons;
  iconNameFocused: IONavIcons;
  color?: ColorValue;
  badgeValue?: number;
};

/**
 *  Generic tab icon with badge indicator
 */

export const TabIconComponent = ({
  focused,
  iconName,
  iconNameFocused,
  color,
  badgeValue
}: TabIconComponent) => (
  // accessibilityLabel={""} in order to read the font icon, without modify the library element
  <View accessibilityLabel={""}>
    <AnimatedIcon
      name={focused ? iconNameFocused : iconName}
      size={24}
      color={color}
    />
    {badgeValue && <CustomBadge badgeValue={badgeValue} />}
  </View>
);

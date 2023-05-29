/**
 * Service tab icon with badge indicator
 * Note: badge counter has been disabled for these reasons https://www.pivotaltracker.com/story/show/176919053
 */
import React from "react";
import { ColorValue } from "react-native";
import { TabIconComponent } from "./ui/TabIconComponent";

type ServiceTabIcon = {
  focused: boolean;
  color: ColorValue;
};

const ServiceTabIcon = ({ focused, color }: ServiceTabIcon) => (
  <TabIconComponent
    iconName="navServices"
    iconNameFocused="navServicesSelected"
    color={color}
    focused={focused}
  />
);

export default ServiceTabIcon;

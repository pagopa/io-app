/**
 * Service tab icon with badge indicator
 * Note: badge counter has been disabled for these reasons https://www.pivotaltracker.com/story/show/176919053
 */
import React from "react";
import { ColorValue } from "react-native";
import TabIconComponent from "./ui/TabIconComponent";

type Props = {
  color?: ColorValue;
};

class ServiceTabIcon extends React.PureComponent<Props> {
  public render() {
    return <TabIconComponent iconName="navServices" color={this.props.color} />;
  }
}

export default ServiceTabIcon;

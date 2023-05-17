import { ColorValue, View } from "react-native";
import React from "react";
import { AnimatedIcon, IONavIcons } from "../core/icons";
import CustomBadge from "./CustomBadge";

type Props = {
  iconName: IONavIcons;
  color?: ColorValue;
  badgeValue?: number;
};

/**
 *  Generic tab icon with badge indicator
 */
class TabIconComponent extends React.PureComponent<Props> {
  public render() {
    const { color, badgeValue, iconName } = this.props;
    return (
      // accessibilityLabel={""} in order to read the font icon, without modify the library element
      <View accessibilityLabel={""}>
        <AnimatedIcon name={iconName} size={24} color={color} />
        <CustomBadge badgeValue={badgeValue} />
      </View>
    );
  }
}

export default TabIconComponent;

import { View } from "react-native";
import React from "react";
import variables from "../../theme/variables";
import CustomBadge from "./CustomBadge";

import IconFont from "./IconFont";

type Props = {
  iconName: string;
  color?: string;
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
        <IconFont name={iconName} size={variables.iconSize3} color={color} />
        <CustomBadge badgeValue={badgeValue} />
      </View>
    );
  }
}

export default TabIconComponent;

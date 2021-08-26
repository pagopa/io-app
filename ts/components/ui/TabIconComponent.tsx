import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import variables from "../../theme/variables";
import CustomBadge from "./CustomBadge";

import IconFont from "./IconFont";

type Props = {
  iconName: string;
  color?: string;
  badgeValue?: number;
};

const styles = StyleSheet.create({
  textStyle: {
    paddingLeft: 0,
    paddingRight: 0
  },
  badgeStyle: {
    backgroundColor: variables.brandPrimary,
    borderColor: "white",
    borderWidth: 2,
    position: "absolute",
    elevation: 0.1,
    shadowColor: "white",
    height: 19,
    width: 19,
    left: 12,
    bottom: 10,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: "center",
    alignContent: "center"
  }
});

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
        {badgeValue && badgeValue > 0 ? (
          <CustomBadge
            badgeStyle={styles.badgeStyle}
            textStyle={styles.textStyle}
            badgeValue={badgeValue}
          />
        ) : null}
      </View>
    );
  }
}

export default TabIconComponent;

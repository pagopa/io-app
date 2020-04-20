import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";
import customVariables from "../theme/variables";
import IconFont from "./ui/IconFont";

type Props = {
  heading: React.ReactNode;
  icon?: ImageSourcePropType;
  iconFont?: IconProps; // TODO: manage header image as icon https://www.pivotaltracker.com/story/show/172105485
  dark?: boolean;
};

const HEADER_HEIGHT = 48;

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: customVariables.brandDarkGray
  },
  container: {
    justifyContent: "space-between",
    paddingHorizontal: customVariables.contentPadding,
    height: HEADER_HEIGHT
  },
  text: {
    flex: 1,
    flexGrow: 1
  },
  image: {
    maxHeight: HEADER_HEIGHT,
    maxWidth: HEADER_HEIGHT,
    resizeMode: "contain",
    flex: 1
  }
});

/**
 * Component that implements the screen header with heading to the left
 * and an icon image to the right
 */
class ScreenHeader extends React.Component<Props> {
  public render() {
    const { heading, icon, dark, iconFont } = this.props;

    const imageColor =
      this.props.iconFont && this.props.iconFont.color
        ? this.props.iconFont.color
        : dark
          ? customVariables.headerIconDark
          : customVariables.headerIconLight;

    return (
      <View style={[dark && styles.darkGrayBg, styles.container]}>
        <View style={styles.text}>{heading}</View>
        {icon && <Image source={icon} style={styles.image} />}
        {iconFont && (
          <IconFont
            name={iconFont.name}
            size={iconFont.size || HEADER_HEIGHT}
            color={imageColor}
          />
        )}
      </View>
    );
  }
}

export default connectStyle(
  "UIComponent.ScreenHeader",
  {},
  mapPropsToStyleNames
)(ScreenHeader);

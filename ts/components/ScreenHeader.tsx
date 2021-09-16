import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";
import customVariables from "../theme/variables";
import { HEADER_ICON_HEIGHT } from "../utils/constants";
import IconFont from "./ui/IconFont";

type Props = {
  heading: React.ReactNode;
  icon?: ImageSourcePropType;
  iconFont?: IconProps;
  dark?: boolean;
  // Specified if a custom component is needed, if both icon and rightComponent are defined rightComponent
  // will be rendered in place of icon
  rightComponent?: React.ReactElement;
};

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: customVariables.brandDarkGray
  },
  container: {
    justifyContent: "space-between",
    paddingHorizontal: customVariables.contentPadding,
    minHeight: HEADER_ICON_HEIGHT
  },
  text: {
    flex: 1,
    flexGrow: 1
  },
  image: {
    maxHeight: HEADER_ICON_HEIGHT,
    maxWidth: HEADER_ICON_HEIGHT,
    resizeMode: "contain",
    flex: 1
  }
});

/**
 * Component that implements the screen header with heading to the left
 * and an icon image to the right. The icon can be an image or an icon (from io-icon-font)
 */
class ScreenHeader extends React.Component<Props> {
  private getIcon = () => {
    const { icon } = this.props;
    if (icon) {
      return <Image source={icon} style={styles.image} />;
    }
    const { iconFont } = this.props;
    return fromNullable(iconFont).fold(undefined, ic => {
      const { dark } = this.props;
      const imageColor = fromNullable(ic.color).getOrElse(
        fromNullable(dark).fold(customVariables.headerIconLight, isDark =>
          isDark
            ? customVariables.headerIconDark
            : customVariables.headerIconLight
        )
      );
      return (
        <IconFont
          importantForAccessibility={"no-hide-descendants"}
          name={ic.name}
          size={Math.min(ic.size || HEADER_ICON_HEIGHT, HEADER_ICON_HEIGHT)}
          color={imageColor}
        />
      );
    });
  };

  public render() {
    const { heading, dark, rightComponent } = this.props;
    return (
      <View
        importantForAccessibility={"no-hide-descendants"}
        style={[dark && styles.darkGrayBg, styles.container]}
      >
        <View
          accessible={true}
          style={styles.text}
          accessibilityRole={"header"}
        >
          {heading}
        </View>
        {fromNullable(rightComponent).fold(this.getIcon(), c => c)}
      </View>
    );
  }
}

export default connectStyle(
  "UIComponent.ScreenHeader",
  {},
  mapPropsToStyleNames
)(ScreenHeader);

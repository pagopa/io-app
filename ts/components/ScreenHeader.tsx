import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import customVariables from '../theme/variables';

type Props = {
  heading: React.ReactNode;
  icon?: ImageSourcePropType;
  dark?: boolean;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 0,
    width: 48,
    zIndex: -1
  },
  image: {
    resizeMode: "contain",
    width: "100%"
  }
});

/**
 * Component that implements the screen header with heading to the left
 * and an icon image to the right
 */
class ScreenHeader extends React.Component<Props> {
  public render() {
    const { heading, icon, dark } = this.props;

    return (
      <View style={ dark && {backgroundColor:customVariables.brandDarkGray}}>
        {heading}
        {icon && (
          <View style={styles.container}>
            <Image source={icon} style={styles.image} />
          </View>
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

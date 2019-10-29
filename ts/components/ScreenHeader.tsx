import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet
} from "react-native";
import customVariables from "../theme/variables";

type Props = {
  heading: React.ReactNode;
  icon?: ImageSourcePropType;
  dark?: boolean;
};

const width = Dimensions.get("window").width / 100;

const padding = 20;
const containerIconWidth = width * 25;
const containerHeadingWidth = width * 75 - padding;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  column: {
    width: containerIconWidth,
    flexDirection: "column",
    justifyContent: "center",
    alignSelf: "center",
    overflow: "hidden",
    paddingRight: padding
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  containerHeading: {
    width: containerHeadingWidth,
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: padding,
    paddingTop: 5,
    alignSelf: "center",
    overflow: "hidden"
  },
  image: {
    resizeMode: "contain",
    width: 48,
    height: 48,
    alignSelf: "center"
  },
  darkGrayBg: {
    backgroundColor: customVariables.brandDarkGray
  },
  colorWhite: {
    color: "#fff"
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
      <View style={[dark && styles.darkGrayBg, styles.container]}>
        <View style={styles.containerHeading}>{heading}</View>
        {icon && (
          <View style={styles.column}>
            <View style={styles.row}>
              <Image source={icon} style={styles.image} />
            </View>
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

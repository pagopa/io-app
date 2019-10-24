import { H3, View } from "native-base";
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

const width = Dimensions.get("window").width / 10;

const padding = 20;
const containerIconWidth = width * 2;
const containerHeadingWidth = width * 8 - padding;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  containerIcon: {
    width: containerIconWidth,
    flexDirection: "column",
    justifyContent: "center",
    alignSelf: "center",
    overflow: "hidden",
    paddingRight: padding
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
        <View style={styles.containerHeading}>
          <H3 style={dark && styles.colorWhite}>{heading}</H3>
        </View>

        {icon && (
          <View style={styles.containerIcon}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center"
              }}
            >
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

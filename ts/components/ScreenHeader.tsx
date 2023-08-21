import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { View, Image, ImageSourcePropType, StyleSheet } from "react-native";
import {
  IOIconSizeScale,
  IOIcons,
  IOPictogramSizeScale,
  IOSectionPictogramType,
  Icon
} from "@pagopa/io-app-design-system";
import customVariables from "../theme/variables";
import { IOColors } from "../components/core/variables/IOColors";
import { IOStyles } from "./core/variables/IOStyles";
import SectionPictogram from "./core/pictograms/SectionPictogram";

type Props = {
  heading: React.ReactNode;
  rasterIcon?: ImageSourcePropType;
  icon?: IOIcons;
  pictogram?: IOSectionPictogramType;
  dark?: boolean;
  // Specified if a custom component is needed, if both icon and rightComponent are defined rightComponent
  // will be rendered in place of icon
  rightComponent?: React.ReactElement;
};

const HEADER_PICTOGRAM_HEIGHT: IOPictogramSizeScale = 48;
const HEADER_ICON_HEIGHT: IOIconSizeScale = 48;
const HEADER_ICON_DARK: IOColors = "grey-650";
const HEADER_ICON_LIGHT: IOColors = "grey-200";

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: IOColors.bluegrey
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
 * and an icon image to the right. The icon can be: an image, a pictogram or an icon
 */
class ScreenHeader extends React.Component<Props> {
  /* The following function doesn't seem very elegant,
  but I inherited this logic. Considering that this 
  component may be replaced soon and that it affects
  a lot of pages, I give up on refactoring it. */
  private getIcon = () => {
    // If the image is PNG or other raster formats
    const { rasterIcon, pictogram, icon, dark } = this.props;
    if (rasterIcon) {
      return <Image source={rasterIcon} style={styles.image} />;
    }
    // If the image is a pictogram
    if (pictogram) {
      const pictogramColor = dark ? HEADER_ICON_DARK : HEADER_ICON_LIGHT;
      return (
        <SectionPictogram
          name={pictogram}
          size={HEADER_PICTOGRAM_HEIGHT}
          color={pictogramColor}
        />
      );
    }
    // If the image is an icon
    if (icon) {
      const iconColor = dark ? HEADER_ICON_DARK : HEADER_ICON_LIGHT;
      return <Icon name={icon} color={iconColor} size={HEADER_ICON_HEIGHT} />;
    } else {
      return undefined;
    }
  };

  public render() {
    const { heading, dark, rightComponent } = this.props;
    return (
      <View
        style={[
          dark && styles.darkGrayBg,
          styles.container,
          IOStyles.row,
          { alignItems: "center" }
        ]}
      >
        <View
          accessible={true}
          style={styles.text}
          accessibilityRole={"header"}
        >
          {heading}
        </View>
        {pipe(
          rightComponent,
          O.fromNullable,
          O.fold(
            () => this.getIcon(),
            c => c
          )
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

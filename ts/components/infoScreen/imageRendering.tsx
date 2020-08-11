import * as React from "react";
import { Dimensions, Image, ImageSourcePropType } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";

import { StyleSheet } from "react-native";

const infoImageSize = 102;
const screenHeight = Dimensions.get("screen").height;
const maxHeightFullSize = 650;

/**
 * On device with screen size < 650, the image size is reduced
 */
const styles = StyleSheet.create({
  raster: {
    width:
      screenHeight >= maxHeightFullSize
        ? infoImageSize
        : heightPercentageToDP("11%"),
    height:
      screenHeight >= maxHeightFullSize
        ? infoImageSize
        : heightPercentageToDP("11%")
  }
});
/**
 * A generic component to render an image with all the settings for a {@link InfoScreenComponent}
 * @param image
 */
export const renderInfoRasterImage = (image: ImageSourcePropType) => (
  <Image source={image} resizeMode={"contain"} style={styles.raster} />
);

export const renderInfoIconImage = (
  image: string,
  iconSize: number = infoImageSize
) => (
  <IconFont
    name={image}
    size={iconSize}
    color={customVariables.brandHighlight}
  />
);

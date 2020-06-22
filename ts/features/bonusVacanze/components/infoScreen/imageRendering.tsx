import * as React from "react";
import { Dimensions, Image, ImageSourcePropType } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import IconFont from "../../../../components/ui/IconFont";
import customVariables from "../../../../theme/variables";

import { StyleSheet } from "react-native";

const infoImageSize = 102;
const screenHeight = Dimensions.get("screen").height;
const maxHeightFullSize = 650;

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

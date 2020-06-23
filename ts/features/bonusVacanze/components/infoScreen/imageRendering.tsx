import * as React from "react";
import { Image, ImageSourcePropType } from "react-native";
import IconFont from "../../../../components/ui/IconFont";
import customVariables from "../../../../theme/variables";

import { StyleSheet } from "react-native";

const infoImageSize = 128;
const styles = StyleSheet.create({
  raster: {
    width: infoImageSize,
    height: infoImageSize
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

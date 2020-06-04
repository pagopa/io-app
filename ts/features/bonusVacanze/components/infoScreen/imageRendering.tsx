import * as React from "react";
import { Image, ImageSourcePropType } from "react-native";
import IconFont from "../../../../components/ui/IconFont";
import customVariables from "../../../../theme/variables";

export const renderRasterImage = (image: ImageSourcePropType) => (
  <Image source={image} resizeMode={"contain"} />
);

const iconDefaultSize = 120;
export const renderIconImage = (
  image: string,
  iconSize: number = iconDefaultSize
) => (
  <IconFont
    name={image}
    size={iconSize}
    color={customVariables.brandHighlight}
  />
);

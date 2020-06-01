import * as React from "react";
import { Image, ImageSourcePropType } from "react-native";
import IconFont from "../../../../components/ui/IconFont";
import customVariables from "../../../../theme/variables";

export const renderRasterImage = (image: ImageSourcePropType) => (
  <Image source={image} resizeMode="contain" />
);

export const renderIconImage = (image: string) => (
  <IconFont name={image} size={120} color={customVariables.brandHighlight} />
);

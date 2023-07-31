import React from "react";
import { Svg, Rect, G, Circle } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSystemAppsAndroid = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Rect width={size} height={size} fill="#F79E1B" rx="8" />
    <G fill="#fff">
      <Circle cx="8" cy="8" r="3" />
      <Circle cx="8" cy="16" r="3" />
      <Circle cx="16" cy="16" r="3" />
      <Circle cx="16" cy="8" r="3" />
    </G>
  </Svg>
);

export default IconSystemAppsAndroid;

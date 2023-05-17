import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconAdd = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M13.615 5h-3.23v5.385H5v3.23h5.385V19h3.23v-5.385H19v-3.23h-5.385V5Z"
      fill="currentColor"
    />
    <Path
      d="M13.615 5h-3.23v5.385H5v3.23h5.385V19h3.23v-5.385H19v-3.23h-5.385V5Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconAdd;

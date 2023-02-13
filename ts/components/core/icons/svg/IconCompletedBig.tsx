import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCompletedBig = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="m9.278 13.775 8.672-8.672a.5.5 0 0 1 .707 0l1.424 1.424a.5.5 0 0 1 0 .707l-8.964 8.964a.497.497 0 0 1-.023.025L9.756 17.61a.5.5 0 0 1-.707.012l-5.784-5.585a.5.5 0 0 1-.012-.707L4.59 9.943a.5.5 0 0 1 .707-.012l3.98 3.844Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCompletedBig;

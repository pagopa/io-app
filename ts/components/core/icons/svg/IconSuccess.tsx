import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSuccess = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0Zm6.69 7.831-7.385 8.654a.9.9 0 0 1-1.267.112l-4.615-3.846A.989.989 0 0 1 5.28 11.4a.898.898 0 0 1 1.297-.151l3.931 3.275 6.803-7.971a.897.897 0 0 1 1.303-.08.99.99 0 0 1 .077 1.358Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconSuccess;

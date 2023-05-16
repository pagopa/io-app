import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconHomeFill = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.9 1.076a5 5 0 0 1 6.2 0l7 5.53a5 5 0 0 1 1.9 3.923v8.374a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5v-8.374a5 5 0 0 1 1.9-3.923l7-5.53ZM12 12.903a3 3 0 0 0-3 3v6h6v-6a3 3 0 0 0-3-3Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconHomeFill;

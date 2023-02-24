import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconArrowBottom = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M6.49 17.383a1 1 0 1 0-1.281 1.536l5.36 4.467a2 2 0 0 0 2.56 0l5.36-4.467a1 1 0 1 0-1.28-1.536l-4.36 3.633V1.15a1 1 0 1 0-2 0v19.865l-4.36-3.633Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconArrowBottom;

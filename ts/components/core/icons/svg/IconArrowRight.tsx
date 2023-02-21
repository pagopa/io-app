import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconArrowRight = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M17.232 17.36a1 1 0 0 0 1.536 1.28l4.467-5.36a2 2 0 0 0 0-2.56l-4.467-5.36a1 1 0 1 0-1.536 1.28L20.865 11H1a1 1 0 1 0 0 2h19.865l-3.633 4.36Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconArrowRight;

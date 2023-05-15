import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconArrowUp = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M6.64 6.768a1 1 0 1 1-1.28-1.536L10.72.765a2 2 0 0 1 2.56 0l5.36 4.467a1 1 0 1 1-1.28 1.536L13 3.135V23a1 1 0 1 1-2 0V3.135L6.64 6.768Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconArrowUp;

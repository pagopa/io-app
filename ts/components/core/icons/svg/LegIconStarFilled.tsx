import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconStarFilled = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="m12 19.092-6.792 3.52 1.298-7.457L1 9.865l7.608-1.089L12 2l3.392 6.776L23 9.866l-5.506 5.289 1.298 7.456L12 19.092Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconStarFilled;

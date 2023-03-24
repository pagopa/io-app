import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconStarEmpty = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M6.82 20.414 12 17.729l5.18 2.685-.989-5.685 4.18-4.017-5.777-.827L12 4.705l-2.594 5.18-5.777.827 4.18 4.017-.99 5.685ZM12 19.093l-6.792 3.52 1.298-7.457L1 9.866l7.607-1.09L12 2l3.393 6.776L23 9.866l-5.506 5.29 1.298 7.456L12 19.092Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconStarEmpty;

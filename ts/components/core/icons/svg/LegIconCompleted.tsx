import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconCompleted = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M16.2 8.137a1.176 1.176 0 0 1 1.69 1.633l-.09.093-6.47 6a1.177 1.177 0 0 1-1.492.089l-.109-.09L6.2 12.59a1.176 1.176 0 0 1 1.501-1.807l.099.082 2.729 2.53L16.2 8.137Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconCompleted;

import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconClose = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M17.81 18.707a.89.89 0 0 1-1.32 0l-4.94-5.293-4.94 5.293a.89.89 0 0 1-1.32 0 1.051 1.051 0 0 1 0-1.414L10.23 12 5.29 6.707a1.051 1.051 0 0 1 0-1.414.89.89 0 0 1 1.32 0l4.94 5.293 4.94-5.293a.89.89 0 0 1 1.32 0c.365.39.365 1.024 0 1.414L12.87 12l4.94 5.293c.365.39.365 1.024 0 1.414Z"
      fill="currentColor"
    />
    <Path
      d="M17.81 18.707a.89.89 0 0 1-1.32 0l-4.94-5.293-4.94 5.293a.89.89 0 0 1-1.32 0 1.051 1.051 0 0 1 0-1.414L10.23 12 5.29 6.707a1.051 1.051 0 0 1 0-1.414.89.89 0 0 1 1.32 0l4.94 5.293 4.94-5.293a.89.89 0 0 1 1.32 0c.365.39.365 1.024 0 1.414L12.87 12l4.94 5.293c.365.39.365 1.024 0 1.414Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconClose;

import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconBonus = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 5c0-.55228.44772-1 1-1h10.5858l1 1c.781.78105 2.0474.78105 2.8284 0l1-1H21c.5523 0 1 .44772 1 1v14c0 .5523-.4477 1-1 1h-2.5858l-1-1c-.781-.781-2.0474-.781-2.8284 0l-1 1H3c-.55228 0-1-.4477-1-1V5Zm1-3C1.34315 2 0 3.34315 0 5v14c0 1.6569 1.34315 3 3 3h10.5858c.5304 0 1.0391-.2107 1.4142-.5858l1-1 1 1c.3751.3751.8838.5858 1.4142.5858H21c1.6569 0 3-1.3431 3-3V5c0-1.65685-1.3431-3-3-3h-2.5858c-.5304 0-1.0391.21071-1.4142.58579l-1 1-1-1A2.00005 2.00005 0 0 0 13.5858 2H3Zm14 6c0 .55229-.4477 1-1 1s-1-.44771-1-1c0-.55228.4477-1 1-1s1 .44772 1 1Zm-1 5c.5523 0 1-.4477 1-1s-.4477-1-1-1-1 .4477-1 1 .4477 1 1 1Zm1 3c0 .5523-.4477 1-1 1s-1-.4477-1-1 .4477-1 1-1 1 .4477 1 1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconBonus;

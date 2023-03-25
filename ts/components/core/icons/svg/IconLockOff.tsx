import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconLockOff = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 6a6 6 0 1 1 12 0v2h7a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5v-6a5.002 5.002 0 0 1 4-4.9V6a4 4 0 0 0-8 0v3a1 1 0 1 1-2 0V6Zm8 7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3v-6Zm7 1a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconLockOff;

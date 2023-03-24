import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconLockOn = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 6a6 6 0 1 1 12 0v2.416c1.766.772 3 2.534 3 4.584v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-6a5.001 5.001 0 0 1 3-4.584V6Zm10 0v2H8V6a4 4 0 1 1 8 0Zm-8 4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H8Zm4 4a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconLockOn;

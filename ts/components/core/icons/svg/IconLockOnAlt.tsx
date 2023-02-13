import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconLockOnAlt = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M13 15.732V18a1 1 0 1 1-2 0v-2.268A2 2 0 0 1 12 12a2 2 0 0 1 1 3.732ZM16 9V7.992A3.996 3.996 0 0 0 12 4a4 4 0 0 0-4 3.992V9h8ZM7 9V7.992A5 5 0 0 1 12 3c2.761 0 5 2.235 5 4.992V9h1.006C19.107 9 20 9.894 20 11.003v8.994A2 2 0 0 1 18.006 22H5.994A1.996 1.996 0 0 1 4 19.997v-8.994A2 2 0 0 1 5.994 9H7Zm-2 2.003v8.994A.996.996 0 0 0 5.994 21h12.012A1 1 0 0 0 19 19.997v-8.994A.996.996 0 0 0 18.006 10H5.994A1 1 0 0 0 5 11.003Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconLockOnAlt;

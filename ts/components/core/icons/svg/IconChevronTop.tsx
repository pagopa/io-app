import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconChevronTop = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M4.746 16.207a1.047 1.047 0 0 1-.078-1.32l.078-.094 6.589-7a.9.9 0 0 1 1.242-.083l.089.083 6.588 7c.367.39.367 1.024 0 1.414a.9.9 0 0 1-1.242.083l-.09-.083L12 9.915l-5.923 6.292a.9.9 0 0 1-1.242.083l-.089-.083Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconChevronTop;

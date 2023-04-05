import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconProfile = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M.93 22a1 1 0 1 0 2 0c0-3.529 2.031-6.653 5.198-8.13a6.953 6.953 0 0 0 7.615-.008 9.128 9.128 0 0 1 2.55 1.775A8.942 8.942 0 0 1 20.93 22a1 1 0 1 0 2 0c0-2.936-1.145-5.698-3.223-7.777a11.071 11.071 0 0 0-2.37-1.784A6.967 6.967 0 0 0 18.928 8c0-3.86-3.14-7-7-7s-7 3.14-7 7c0 1.68.595 3.222 1.585 4.43A10.934 10.934 0 0 0 .93 22ZM11.929 3c2.756 0 5 2.243 5 5s-2.243 5-5 5-5-2.243-5-5 2.243-5 5-5Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconProfile;

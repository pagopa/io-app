import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconEyeShow = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.377 11.667A10.997 10.997 0 0 1 12.001 6c4.138 0 7.744 2.285 9.623 5.666a.686.686 0 0 1 0 .667A10.997 10.997 0 0 1 12 18a10.997 10.997 0 0 1-9.623-5.666.686.686 0 0 1 0-.667zM12.001 4A12.997 12.997 0 0 0 .629 10.696a2.686 2.686 0 0 0 0 2.609A12.997 12.997 0 0 0 12 20c4.894 0 9.155-2.705 11.372-6.696.45-.812.45-1.797 0-2.609A12.997 12.997 0 0 0 12.001 4zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm2 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"
      fill="currentColor"
    />
  </Svg>
);

export default IconEyeShow;

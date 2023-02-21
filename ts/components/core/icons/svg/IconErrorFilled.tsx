import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconErrorFilled = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.121 1.465A5 5 0 0 1 8.657 0h6.685a5 5 0 0 1 3.536 1.464l3.657 3.657A5 5 0 0 1 24 8.657v6.686a5 5 0 0 1-1.465 3.536l-3.657 3.657A5 5 0 0 1 15.342 24H8.656a5 5 0 0 1-3.536-1.465l-3.655-3.656A5 5 0 0 1 0 15.344V8.657a5 5 0 0 1 1.465-3.536L5.12 1.465ZM11.998 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm0 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconErrorFilled;

import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconErrorFilled = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.121 1.465A5 5 0 0 1 8.657 0h6.685a5 5 0 0 1 3.536 1.464l3.657 3.657A5 5 0 0 1 24 8.657v6.686a5 5 0 0 1-1.465 3.536l-3.657 3.657A5 5 0 0 1 15.342 24H8.656a5 5 0 0 1-3.536-1.465l-3.655-3.656A5 5 0 0 1 0 15.344V8.657a5 5 0 0 1 1.465-3.536L5.12 1.465Zm6.907 15.04a1.528 1.528 0 1 1 0 3.056 1.528 1.528 0 0 1 0-3.056Zm0-1.944c.568 0 1.029-.46 1.029-1.028V5.528a1.028 1.028 0 0 0-2.057 0v8.005c0 .567.46 1.028 1.029 1.028Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconErrorFilled;

import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconWarningFilled = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m15.523 3.047 7.926 13.813c1.566 2.73-.392 6.14-3.523 6.14H4.074C.942 23-1.015 19.59.55 16.86L8.477 3.047c1.566-2.73 5.48-2.73 7.046 0Zm-3.495 13.458a1.528 1.528 0 1 1 0 3.056 1.528 1.528 0 0 1 0-3.056Zm0-1.944c.568 0 1.029-.46 1.029-1.028V5.528a1.028 1.028 0 0 0-2.057 0v8.005c0 .567.46 1.028 1.029 1.028Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconWarningFilled;

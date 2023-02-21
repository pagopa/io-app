import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconWarningFilled = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m23.449 17.302-7.926-15.07c-1.566-2.976-5.48-2.976-7.046 0L.551 17.303C-1.015 20.28.942 24 4.074 24h15.852c3.132 0 5.089-3.72 3.523-6.698ZM11.999 4.465c.562 0 1.017.5 1.017 1.116v8.93c0 .617-.455 1.117-1.017 1.117-.561 0-1.017-.5-1.017-1.116v-8.93c0-.617.456-1.117 1.017-1.117Zm1.017 14.512c0 .616-.455 1.116-1.017 1.116-.561 0-1.017-.5-1.017-1.116 0-.617.456-1.117 1.017-1.117.562 0 1.017.5 1.017 1.117Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconWarningFilled;

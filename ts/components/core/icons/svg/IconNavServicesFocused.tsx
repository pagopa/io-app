import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconNavServicesFocused = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.1551 1.04762c-.7356-1.39683-2.5746-1.39683-3.3102 0l-3.586 6.80952C12.5233 9.25397 13.4428 11 14.914 11h7.172c1.4712 0 2.3907-1.74603 1.6551-3.14286l-3.586-6.80952ZM3.5.5c-1.65685 0-3 1.34315-3 3V8c0 1.65685 1.34315 3 3 3H8c1.65685 0 3-1.34315 3-3V3.5c0-1.65685-1.34315-3-3-3H3.5Zm13 13c-1.6569 0-3 1.3431-3 3V21c0 1.6569 1.3431 3 3 3H21c1.6569 0 3-1.3431 3-3v-4.5c0-1.6569-1.3431-3-3-3h-4.5Zm-5.5 5c0 3.0376-2.46243 5.5-5.5 5.5S0 21.5376 0 18.5 2.46243 13 5.5 13s5.5 2.4624 5.5 5.5Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconNavServicesFocused;

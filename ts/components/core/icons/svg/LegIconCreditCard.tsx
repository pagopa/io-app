import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconCreditCard = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M21.375 3.75H2.625A2.628 2.628 0 0 0 0 6.375v11.25a2.628 2.628 0 0 0 2.625 2.625h18.75A2.628 2.628 0 0 0 24 17.625V6.375a2.628 2.628 0 0 0-2.625-2.625Zm-18.75 1.5h18.75c.62 0 1.125.505 1.125 1.125v1.5h-21v-1.5c0-.62.505-1.125 1.125-1.125Zm18.75 13.5H2.625c-.62 0-1.125-.505-1.125-1.125v-8.25h21v8.25c0 .62-.505 1.125-1.125 1.125Z"
      fill="currentColor"
    />
    <Path
      d="M5.25 16.5H4.5a.75.75 0 0 1-.75-.75V15a.75.75 0 0 1 .75-.75h.75A.75.75 0 0 1 6 15v.75a.75.75 0 0 1-.75.75Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconCreditCard;

import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCurrencyEuro = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.373 7.5C7.155 3.104 11.467 0 16.5 0c2.55 0 4.914.797 6.858 2.154a1.5 1.5 0 1 1-1.716 2.46A8.999 8.999 0 0 0 8.706 7.5H16.5a1.5 1.5 0 0 1 0 3H7.625A8.984 8.984 0 0 0 7.5 12c0 .511.042 1.012.125 1.5H16.5a1.5 1.5 0 0 1 0 3H8.706a8.999 8.999 0 0 0 12.936 2.886 1.5 1.5 0 0 1 1.716 2.46A11.937 11.937 0 0 1 16.5 24c-5.033 0-9.345-3.103-11.127-7.5H1.5a1.5 1.5 0 0 1 0-3h3.093a12.076 12.076 0 0 1 0-3H1.5a1.5 1.5 0 0 1 0-3h3.873Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCurrencyEuro;

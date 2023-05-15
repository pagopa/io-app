import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconBarcode = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.222 5a1 1 0 0 1 1-1h2v16h-2a1 1 0 0 1-1-1V5Zm6-1h3v16h-3V4Zm8 0h3v16h-3V4Zm5 0h-1v16h1a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Zm-14 0h-1v16h1V4Zm5 0h1v16h-1V4Zm3 0h-1v16h1V4Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconBarcode;

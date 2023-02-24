import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSuccess = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 12C0 5.373 5.373 0 12 0s12 5.373 12 12-5.373 12-12 12S0 18.627 0 12Zm17.707-1.293a1 1 0 0 0-1.414-1.414L10 15.586l-3.293-3.293a1 1 0 0 0-1.414 1.414L8.586 17a2 2 0 0 0 2.828 0l6.293-6.293Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconSuccess;

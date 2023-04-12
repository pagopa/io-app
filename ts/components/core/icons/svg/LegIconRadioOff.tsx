import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconRadioOff = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 11c0-6.07513-4.9249-11-11-11C4.92487 0 0 4.92487 0 11c0 6.0751 4.92487 11 11 11 6.0751 0 11-4.9249 11-11ZM2 11c0-4.97056 4.02944-9 9-9 4.9706 0 9 4.02944 9 9 0 4.9706-4.0294 9-9 9-4.97056 0-9-4.0294-9-9Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconRadioOff;

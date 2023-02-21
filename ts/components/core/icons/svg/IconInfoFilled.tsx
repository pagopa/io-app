import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconInfoFilled = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm1.028 17.96a1.028 1.028 0 1 1-2.056 0V9.954a1.028 1.028 0 1 1 2.056 0v8.004ZM12 7.07a1.028 1.028 0 1 1 0-2.057 1.028 1.028 0 0 1 0 2.056Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconInfoFilled;

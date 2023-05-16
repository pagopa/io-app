import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconInfoFilled = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm.028 7.556a1.528 1.528 0 1 0 0-3.056 1.528 1.528 0 0 0 0 3.056Zm0 1.944c.568 0 1.029.46 1.029 1.028v8.005a1.028 1.028 0 0 1-2.057 0v-8.005c0-.568.46-1.028 1.029-1.028Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconInfoFilled;

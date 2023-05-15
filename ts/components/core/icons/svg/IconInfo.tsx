import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconInfo = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M12.028 7.556a1.528 1.528 0 1 0 0-3.056 1.528 1.528 0 0 0 0 3.056ZM12.028 9.5C11.46 9.5 11 9.96 11 10.528v8.005a1.028 1.028 0 0 0 2.057 0v-8.005c0-.568-.461-1.028-1.029-1.028Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 12C0 5.373 5.373 0 12 0s12 5.373 12 12-5.373 12-12 12S0 18.627 0 12Zm19.288-7.288A10.238 10.238 0 0 0 12 1.693c-2.753 0-5.34 1.072-7.288 3.02A10.24 10.24 0 0 0 1.693 12c0 2.753 1.072 5.341 3.02 7.288A10.24 10.24 0 0 0 12 22.307c2.753 0 5.34-1.072 7.288-3.02A10.238 10.238 0 0 0 22.307 12c0-2.753-1.072-5.34-3.02-7.288Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconInfo;

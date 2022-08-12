import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconInfo = ({ size, color }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M11 18a1 1 0 1 0 2 0v-6a1 1 0 1 0-2 0v6ZM12 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
      fill={color}
    />
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0Zm0 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
      fill={color}
    />
  </Svg>
);

export default IconInfo;

import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconFornitori = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 3H6v1a1 1 0 0 1-2 0V3a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H10v1a1 1 0 1 1-2 0V3zm0 8v-1H6v1a1 1 0 1 1-2 0v-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H10v1a1 1 0 1 1-2 0zm0 6v1a1 1 0 1 0 2 0v-1h10a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2v1a1 1 0 1 0 2 0v-1h2zM9 1H4a4 4 0 0 0-4 4v1a3.99 3.99 0 0 0 1.354 3A3.99 3.99 0 0 0 0 12v1a3.99 3.99 0 0 0 1.354 3A3.99 3.99 0 0 0 0 19v1a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-1a3.99 3.99 0 0 0-1.354-3A3.99 3.99 0 0 0 24 13v-1a3.99 3.99 0 0 0-1.354-3A3.99 3.99 0 0 0 24 6V5a4 4 0 0 0-4-4H9z"
      fill="currentColor"
    />
  </Svg>
);

export default IconFornitori;

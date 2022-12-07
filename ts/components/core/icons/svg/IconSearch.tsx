import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSearch = ({ size, color }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.766 3.45a6.75 6.75 0 1 0 4.094 12.117l4.349 4.348.085.075a.9.9 0 0 0 1.188-1.347l-4.349-4.349A6.75 6.75 0 0 0 9.766 3.45Zm0 1.8a4.95 4.95 0 1 1 0 9.9 4.95 4.95 0 0 1 0-9.9Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.766 3.45a6.75 6.75 0 1 0 4.094 12.117l4.349 4.348.085.075a.9.9 0 0 0 1.188-1.347l-4.349-4.349A6.75 6.75 0 0 0 9.766 3.45Zm0 1.8a4.95 4.95 0 1 1 0 9.9 4.95 4.95 0 0 1 0-9.9Z"
      fill={color}
    />
  </Svg>
);

export default IconSearch;

import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconShareAndroid = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM8 5a4 4 0 1 1 3.392 3.954.993.993 0 0 1-.037.06l-4.737 6.962a4 4 0 0 1 1.258 2.032c.04-.005.082-.008.124-.008h8c.042 0 .083.003.124.008A4.002 4.002 0 0 1 24 19a4 4 0 0 1-7.876.992c-.04.005-.082.008-.124.008H8c-.042 0-.083-.003-.124-.008A4.002 4.002 0 0 1 0 19a4 4 0 0 1 4.808-3.918l4.719-6.938A3.993 3.993 0 0 1 8 5ZM4 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm16 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconShareAndroid;

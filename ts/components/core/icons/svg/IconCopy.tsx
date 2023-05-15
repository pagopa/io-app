import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCopy = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 18h8a2 2 0 0 0 2-2V9h-4a3 3 0 0 1-3-3V2h-3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Zm9.332-11.987a2 2 0 0 1 .603.987H18a1 1 0 0 1-1-1V2.227a2 2 0 0 1 .406.281l3.926 3.505ZM14 20h-2a4 4 0 0 1-4-4V6H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2Zm2 0h4a4 4 0 0 0 4-4V7.505a4 4 0 0 0-1.336-2.984l-3.926-3.505A4 4 0 0 0 16.074 0H12a4 4 0 0 0-4 4H4a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCopy;

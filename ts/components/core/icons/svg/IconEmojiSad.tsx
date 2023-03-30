import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconEmojiSad = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12ZM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm-2 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm5.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6 16.5a1 1 0 0 0 1.733 1 5 5 0 0 1 8.607-.09 1 1 0 0 0 1.71-1.036A7 7 0 0 0 6 16.5Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconEmojiSad;

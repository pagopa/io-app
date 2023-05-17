import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconAbacus = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 1a1 1 0 0 1 2 0v1h8V1a1 1 0 1 1 2 0v1h2V1a1 1 0 1 1 2 0v1h2V1a1 1 0 1 1 2 0v21h1a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2h1V1Zm10 3v1a1 1 0 1 0 2 0V4h2v1a1 1 0 1 0 2 0V4h2v5h-8V8a1 1 0 1 0-2 0v1H8V8a1 1 0 0 0-2 0v1H4V4h8Zm-6 8v-1H4v5h4v-1a1 1 0 1 1 2 0v1h6v-1a1 1 0 1 1 2 0v1h2v-5h-8v1a1 1 0 1 1-2 0v-1H8v1a1 1 0 1 1-2 0Zm2 6v1a1 1 0 1 0 2 0v-1h6v1a1 1 0 1 0 2 0v-1h2v4H4v-4h4Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconAbacus;

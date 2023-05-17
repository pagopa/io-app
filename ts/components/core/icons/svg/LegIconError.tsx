import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconError = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M7.74 7.74a.818.818 0 0 1 1.08-.068l.077.068L12 10.843l3.103-3.103.077-.068a.818.818 0 0 1 1.08 1.225L13.157 12l3.103 3.103a.818.818 0 0 1-1.08 1.225l-.077-.068L12 13.157 8.897 16.26l-.077.068a.818.818 0 0 1-1.08-1.225L10.843 12 7.74 8.897a.818.818 0 0 1 0-1.157Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12 12-5.373 12-12ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Z"
      fill="currentColor"
    />
    <Path
      d="M7.74 7.74a.818.818 0 0 1 1.08-.068l.077.068L12 10.843l3.103-3.103.077-.068a.818.818 0 0 1 1.08 1.225L13.157 12l3.103 3.103a.818.818 0 0 1-1.08 1.225l-.077-.068L12 13.157 8.897 16.26l-.077.068a.818.818 0 0 1-1.08-1.225L10.843 12 7.74 8.897a.818.818 0 0 1 0-1.157Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12 12-5.373 12-12ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconError;

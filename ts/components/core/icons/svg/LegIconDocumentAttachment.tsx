import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconDocumentAttachment = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M15.194 0h-9.64A2.558 2.558 0 0 0 3 2.554v18.892A2.558 2.558 0 0 0 5.554 24h13.153a2.558 2.558 0 0 0 2.554-2.554v-15.4L15.194 0Zm3.513 22.435H5.554a.99.99 0 0 1-.989-.99V2.556a.99.99 0 0 1 .99-.99l9.054-.009v3.346c0 .979.793 1.773 1.771 1.773l3.279-.01.036 14.78a.99.99 0 0 1-.988.99Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconDocumentAttachment;

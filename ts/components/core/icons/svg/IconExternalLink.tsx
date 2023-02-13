import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconExternalLink = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 21.333H4c-.733 0-1.333-.6-1.333-1.333V4c0-.733.6-1.333 1.333-1.333h6.667c.733 0 1.333-.6 1.333-1.334C12 .6 11.4 0 10.667 0h-8C1.187 0 0 1.2 0 2.667v18.666C0 22.8 1.2 24 2.667 24h18.666C22.8 24 24 22.8 24 21.333v-8C24 12.6 23.4 12 22.667 12c-.734 0-1.334.6-1.334 1.333V20c0 .733-.6 1.333-1.333 1.333Zm-5.333-20c0 .734.6 1.334 1.333 1.334h3.453L7.28 14.84c-.52.52-.52 1.36 0 1.88.52.52 1.36.52 1.88 0L21.333 4.547V8c0 .733.6 1.333 1.334 1.333C23.4 9.333 24 8.733 24 8V1.333C24 .6 23.4 0 22.667 0H16c-.733 0-1.333.6-1.333 1.333Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconExternalLink;

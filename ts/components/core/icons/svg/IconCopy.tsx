import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCopy = ({ size, color }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.52 10.38a2.4 2.4 0 0 0-2.4-2.4H4.08a2.4 2.4 0 0 0-2.4 2.4v8.64a2.4 2.4 0 0 0 2.4 2.4h11.04a2.4 2.4 0 0 0 2.4-2.4v-8.64Zm1.68 6.24h.72a2.4 2.4 0 0 0 2.4-2.4V5.58a2.4 2.4 0 0 0-2.4-2.4H8.88a2.4 2.4 0 0 0-2.4 2.4v.72h9.12c1.99 0 3.6 1.612 3.6 3.6v6.72Zm0 1.68v1.2a3.6 3.6 0 0 1-3.6 3.6h-12A3.601 3.601 0 0 1 0 19.5V9.9a3.6 3.6 0 0 1 3.6-3.6h1.2V5.1a3.6 3.6 0 0 1 3.6-3.6h12c1.99 0 3.6 1.612 3.6 3.6v9.6c0 1.988-1.61 3.6-3.6 3.6h-1.2Z"
      fill={color}
    />
  </Svg>
);

export default IconCopy;

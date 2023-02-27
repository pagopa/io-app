import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconEnvelope = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="m22.72 4.971-10.388 8.904a.5.5 0 0 1-.663 0L1.283 4.973c-.179.3-.282.652-.282 1.027v12c0 1.111.888 2 1.99 2H21.01A1.997 1.997 0 0 0 23 18V6c0-.377-.102-.729-.28-1.029Zm-.715-.705A1.982 1.982 0 0 0 21.01 4H2.991c-.361 0-.701.097-.994.267L12 12.841l10.005-8.575ZM0 6c0-1.657 1.342-3 2.991-3H21.01A2.99 2.99 0 0 1 24 6v12c0 1.657-1.342 3-2.991 3H2.991a2.99 2.99 0 0 1-2.99-3V6Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconEnvelope;

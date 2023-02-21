import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconChevronRight = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M14.325 4.293c.401-.36 1.031-.388 1.467-.083l.105.083 7.778 7c.4.36.43.928.092 1.32l-.092.094-7.778 7a1.2 1.2 0 0 1-1.572 0 .928.928 0 0 1-.092-1.32l.092-.094L21.317 12l-6.992-6.293a.928.928 0 0 1-.092-1.32l.092-.094Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconChevronRight;

import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconChevronLeft = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M9.675 4.293c-.401-.36-1.031-.388-1.467-.083l-.105.083-7.778 7a.928.928 0 0 0-.092 1.32l.092.094 7.778 7a1.2 1.2 0 0 0 1.572 0c.4-.36.43-.928.092-1.32l-.092-.094L2.683 12l6.992-6.293c.4-.36.43-.928.092-1.32l-.092-.094Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconChevronLeft;

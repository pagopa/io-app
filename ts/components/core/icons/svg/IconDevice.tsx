import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconDevice = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M9 0C6.23858 0 4 2.23858 4 5v14c0 2.7614 2.23858 5 5 5h6c2.7614 0 5-2.2386 5-5V5c0-2.76142-2.2386-5-5-5H9ZM6 5c0-1.65685 1.34315-3 3-3h6c1.6569 0 3 1.34315 3 3v14c0 1.6569-1.3431 3-3 3H9c-1.65685 0-3-1.3431-3-3V5Zm6 15c.5523 0 1-.4477 1-1s-.4477-1-1-1-1 .4477-1 1 .4477 1 1 1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconDevice;

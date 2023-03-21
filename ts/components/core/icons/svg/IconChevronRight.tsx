import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconChevronRight = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M7.32544 4.29289c.40053-.36048 1.03079-.38821 1.46667-.08319l.10468.08319 7.77781 7.00001c.4005.3605.4313.9277.0924 1.32l-.0924.0942-7.77781 7c-.43392.3905-1.13744.3905-1.57135 0-.40054-.3605-.43135-.9277-.09243-1.32l.09243-.0942L14.3167 12 7.32544 5.70711c-.40054-.36049-.43135-.92772-.09243-1.32001l.09243-.09421Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconChevronRight;
